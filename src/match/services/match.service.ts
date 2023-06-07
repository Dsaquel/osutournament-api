import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Match } from '../entities/match/match.entity';
import { PlayerService } from './player.service';
import * as helpers from '../helpers/functions';
import { MatchChild, MatchTree } from '../helpers/types';
import { UpdateMatchDto } from '../dto/match.dto';
import { CreateRescheduleDto } from '../dto/reschedule.dto';
import { Reschedule } from '../entities/match/reschedule.entity';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import {
  IParticipantToPlayer,
  TParticipantToPlayer,
} from 'src/common/helper/types.helper';
import {
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(Reschedule)
    private readonly reschedules: Repository<Reschedule>,
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
  ) {}

  async createOrUpdate(tournament: Tournament, numbersPlayers: number | null) {
    try {
      const matches = await this.matches.find({
        where: { tournamentId: tournament.id },
      });

      if (matches) {
        await this.matches.remove(matches);
      }
      await this.createDoubleEliminationBracket(numbersPlayers, tournament.id);
    } catch (e) {
      throw e;
    }
  }

  async findAllByTournamentId(tournamentId: number) {
    try {
      return await this.matches
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.player1', 'player1')
        .leftJoinAndSelect('player1.users', 'player1Users')
        .leftJoinAndSelect('player1.captain', 'player1Captain')
        .leftJoinAndSelect('player1.player', 'player1Player')
        .leftJoinAndSelect('match.player2', 'player2')
        .leftJoinAndSelect('player2.users', 'player2Users')
        .leftJoinAndSelect('player2.player', 'player2Player')
        .leftJoinAndSelect('player2.captain', 'player2Captain')
        .leftJoinAndSelect('match.reschedules', 'reschedules')
        .leftJoinAndSelect('reschedules.superReferee', 'rescheduleSuperReferee')
        .leftJoinAndSelect('match.superReferee', 'matchSuperReferee')
        .where('match.tournamentId = :tournamentId', { tournamentId })
        .orderBy('match.identifier', 'ASC')
        .addOrderBy('reschedules.id', 'ASC')
        .getMany();
    } catch (e) {
      throw e;
    }
  }

  async createReschedule(
    id: number,
    playerId: number,
    createRescheduleDto: CreateRescheduleDto,
  ) {
    try {
      const match = await this.matches.findOne({ where: { id } });
      if (!match) throw new NotFoundException('no match found');
      if (createRescheduleDto.status === 'accepted') {
        const lastRequestReschedule = await this.reschedules.findOne({
          where: {
            matchId: match.id,
            status: 'request',
            playerId: Not(playerId),
          },
          order: { id: 'DESC' },
        });
        match.startDate = lastRequestReschedule.schedule;
        await match.save();
      }
      await this.reschedules
        .create(Object.assign(createRescheduleDto, { matchId: id, playerId }))
        .save();
      return await this.findAllByTournamentId(match.tournamentId);
    } catch (e) {
      console.log(e);
    }
  }

  findRoundsToSave(numbersPlayers: number) {
    try {
      return helpers.getRounds(numbersPlayers);
    } catch (e) {
      throw e;
    }
  }

  async getWinnerBracket(tournamentId: number, round: number) {
    return await this.matches.find({
      where: { round, tournamentId },
    });
  }

  async getLoserBracket(tournamentId: number, round: number) {
    return await this.matches.findAndCount({
      where: { round, tournamentId },
      relations: { player1: true, player2: true },
    });
  }

  async getLastMatch(tournamentId: number) {
    return await this.matches
      .createQueryBuilder('match')
      .where('match.tournamentId = :tournamentId')
      .orderBy('match.identifier', 'DESC')
      .setParameters({ tournamentId })
      .getOne();
  }

  async getMatchesByRound(round: number, tournamentId: number) {
    return await this.matches.find({ where: { round, tournamentId } });
  }

  async updateMatch(
    match: Match,
    superReferee: SuperReferee,
    updateMatchDto: UpdateMatchDto,
  ) {
    try {
      if (
        updateMatchDto.startDate &&
        updateMatchDto.startDate !== match.startDate &&
        match.reschedules.length > 0
      ) {
        await this.reschedules
          .create({
            superRefereeId: superReferee.id,
            shortMessage: 'Schedule updated',
            schedule: updateMatchDto.startDate,
            matchId: match.id,
          })
          .save();
      }

      const matchUpdate = await this.matches.findOne({
        where: { id: match.id },
      });
      Object.assign(matchUpdate, updateMatchDto);
      if (
        matchUpdate.firstTo === matchUpdate.player1Score ||
        matchUpdate.firstTo === matchUpdate.player2Score
      ) {
        const playerIdWinner =
          matchUpdate.firstTo === matchUpdate.player1Score
            ? matchUpdate.player1Id
            : matchUpdate.firstTo === matchUpdate.player2Score
            ? matchUpdate.player2Id
            : null;

        const matchFinal = (
          await this.matches.find({
            where: { tournamentId: match.tournamentId, round: MoreThan(0) },
            order: { round: 'DESC' },
            take: 2,
          })
        ).sort((a, b) => a.identifier - b.identifier);

        if (matchFinal[0].round === matchUpdate.round) {
          if (
            matchFinal[0].identifier === matchUpdate.identifier &&
            matchUpdate.player1Score === matchUpdate.firstTo
          ) {
            const tournament = await this.tournaments.findOne({
              where: { id: matchUpdate.tournamentId },
            });
            tournament.winnerId = matchUpdate.player1Id;
            await tournament.save();
            await matchUpdate.save();
            return await this.findAllByTournamentId(matchUpdate.tournamentId);
          } else {
            if (matchFinal[0].identifier === matchUpdate.identifier) {
              matchFinal[1].player1Id = matchUpdate.player1Id;
              matchFinal[1].player2Id = matchUpdate.player2Id;
              matchUpdate.winnerId = matchUpdate.player2Id;
            } else {
              const tournament = await this.tournaments.findOne({
                where: { id: matchUpdate.tournamentId },
              });
              tournament.winnerId = playerIdWinner;
              await tournament.save();
              matchFinal[1].winnerId = playerIdWinner;
            }

            await this.matches.save([matchFinal[1], matchUpdate]);
            return await this.findAllByTournamentId(matchUpdate.tournamentId);
          }
        }
        const nextWinnerMatch =
          (await this.matches.findOne({
            where: {
              player1PrevIdentifier: matchUpdate.identifier,
              tournamentId: match.tournamentId,
              round: MoreThan(0),
            },
          })) ??
          (await this.matches.findOne({
            where: {
              player2PrevIdentifier: matchUpdate.identifier,
              tournamentId: match.tournamentId,
              round: MoreThan(0),
            },
          })) ??
          (await this.matches.findOne({
            where: {
              player1PrevIdentifier: matchUpdate.identifier,
              tournamentId: match.tournamentId,
            },
            order: { identifier: 'DESC' },
          })) ??
          (await this.matches.findOne({
            where: {
              player2PrevIdentifier: matchUpdate.identifier,
              tournamentId: match.tournamentId,
            },
            order: { identifier: 'DESC' },
          }));

        if (nextWinnerMatch.player1Id) {
          nextWinnerMatch.player2Id = playerIdWinner;
        } else {
          nextWinnerMatch.player1Id = playerIdWinner;
        }
        await nextWinnerMatch.save();
        const nextLooserMatch: Match | null =
          matchUpdate.round > 0
            ? (await this.matches.findOne({
                where: {
                  player1PrevIdentifier: matchUpdate.identifier,
                  tournamentId: match.tournamentId,
                  round: LessThan(0),
                },
              })) ??
              (await this.matches.findOne({
                where: {
                  player2PrevIdentifier: matchUpdate.identifier,
                  tournamentId: match.tournamentId,
                  round: LessThan(0),
                },
              }))
            : null;
        const playerIdLooser =
          matchUpdate.firstTo !== matchUpdate.player1Score
            ? matchUpdate.player1Id
            : matchUpdate.firstTo !== matchUpdate.player2Score
            ? matchUpdate.player2Id
            : null;
        if (nextLooserMatch) {
          if (nextLooserMatch.player1Id) {
            nextLooserMatch.player2Id = playerIdLooser;
          } else {
            nextLooserMatch.player1Id = playerIdLooser;
          }
          await nextLooserMatch.save();
        }
        matchUpdate.winnerId = playerIdWinner;
      }
      await matchUpdate.save();

      return await this.findAllByTournamentId(matchUpdate.tournamentId);
    } catch (e) {
      console.log(e);
    }
  }

  // async createSingleEliminationBracket(tournament: Tournament): Promise<void> {
  //   let matchesByRound = helpers.matchesByRound(tournament.numbersPlayers);
  //   const createIdentifiers = helpers.getIdentifiersSingleElimination(
  //     matchesByRound,
  //     tournament.numbersPlayers,
  //   );
  // }

  async createDoubleEliminationBracket(
    numbersPlayers: number,
    tournamentId: number,
  ): Promise<void> {
    // create winner tree
    const matches = helpers.matchesByRound(numbersPlayers);
    matches.push(1);

    const length = helpers.getLengthTreeLoserBracket(matches, numbersPlayers);
    // create array of matches
    const loserMatches: MatchTree[] = helpers.getLoserMatches(matches, length);
    // create loser tree
    const loserIdentifiers = helpers.getIdentifiersLosersMatches(loserMatches);
    const player2Identifiers = helpers.getIdentifiersWinnersMatches(
      loserIdentifiers,
      numbersPlayers,
    );
    const bracket = helpers.getChildIdentifiers(
      player2Identifiers,
      loserIdentifiers,
      numbersPlayers,
    );
    await this.createMatchLoserBracket(tournamentId, bracket);
  }

  async createMatchLoserBracket(
    tournamentId: Tournament['id'],
    matches: MatchChild[],
  ): Promise<void> {
    matches.forEach(async (branch) => {
      await this.createMatch(
        tournamentId,
        branch.round,
        branch.identifier,
        branch.player1PrevIdentifier,
        branch.player2PrevIdentifier,
      );
    });
  }

  async createMatch(
    tournamentId: Tournament['id'],
    round: Match['round'],
    identifier: Match['identifier'],
    player1PrevIdentifier?: Match['player1PrevIdentifier'] | null,
    player2PrevIdentifier?: Match['player2PrevIdentifier'] | null,
  ): Promise<void> {
    const match = this.matches.create();
    match.tournamentId = tournamentId;
    match.round = round;
    match.identifier = identifier;
    match.player1PrevIdentifier = player1PrevIdentifier;
    match.player2PrevIdentifier = player2PrevIdentifier;
    await match.save();
  }

  async addPlayers(
    tournamentId: number,
    numbersPlayers: number,
    qualifierParticipants: (
      | ParticipantIndividual
      | ParticipantTeam
      | TParticipantToPlayer
      | IParticipantToPlayer
    )[],
  ) {
    try {
      const seeding = helpers.getSeeding(numbersPlayers);

      const matches = await this.matches.find({
        where: { tournamentId },
        order: { identifier: 'ASC' },
      });
      let i = 0;
      while (seeding.length > 0) {
        const seedPair = seeding.splice(0, 2);
        const qualifierParticipant1 = qualifierParticipants.find(
          (participant) =>
            participant.qualifierParticipant.seed === seedPair[0],
        );
        const player1 = await this.playerService.create(
          qualifierParticipant1,
          tournamentId,
        );
        matches[i].player1Id = player1.id;
        matches[i].player1 = player1;
        const qualifierParticipant2 = qualifierParticipants.find(
          (participant) =>
            participant.qualifierParticipant.seed === seedPair[1],
        );
        const player2 = await this.playerService.create(
          qualifierParticipant2,
          tournamentId,
        );
        matches[i].player2Id = player2.id;
        matches[i].player2 = player2;
        i++;
      }
      await this.matches.save(matches);
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot create', e);
    }
  }

  async addOrRemoveReferee(id: number, superRefereeId: number, undo?: boolean) {
    try {
      const match = await this.matches.findOne({ where: { id } });
      if (undo) {
        if (!match.superRefereeId)
          throw new NotFoundException('no referee to delete');
        match.superRefereeId = null;
      } else {
        if (match.superRefereeId)
          throw new ConflictException('there is a referee already');
        match.superRefereeId = superRefereeId;
      }
      await match.save();
      return this.findAllByTournamentId(match.tournamentId);
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot create', e);
    }
  }

  async findAllParticipant() {
    const participants = await this.tournaments.find({
      relations: [
        'owner',
        'matches.participants',
        'matches.participants.player',
      ],
    });
    return participants;
  }

  async findOne(id: number) {
    try {
      const match = await this.matches.findOne({
        where: { id },
        relations: { reschedules: true },
      });
      if (!match) throw new NotFoundException('no match found');
      return match;
    } catch (e) {
      console.log(e);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} match`;
  }
}
