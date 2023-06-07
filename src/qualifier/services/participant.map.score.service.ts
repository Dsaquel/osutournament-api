import { ParticipantMapScore } from '../entities/participant/participant.map.score.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, In, Not, Repository } from 'typeorm';
import { OsuService } from 'src/osu/osu.service';
import { UserService } from 'src/user/user.service';
import * as helpers from '../helpers/function';
import { QualifierMapService } from './map.qualifier.service';
import { QualifierParticipantService } from './participant.qualifier.service';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { QualifierService } from './qualifier.service';

@Injectable()
export class ParticipantMapScoreService {
  constructor(
    @InjectRepository(ParticipantMapScore)
    private readonly participantsMapScore: Repository<ParticipantMapScore>,
    private readonly osuService: OsuService,
    private readonly userService: UserService,
    private readonly qualifierMapService: QualifierMapService,
    private readonly qualifierParticipantService: QualifierParticipantService,
    private readonly qualifierService: QualifierService,
  ) {}

  async findAndSortByScore(
    qualifierMapPlayedId: number,
  ): Promise<ParticipantMapScore[]> {
    return await this.participantsMapScore.find({
      where: { qualifierMapPlayedId },
      order: { score: 'DESC' },
    });
  }

  async create(matchId: number, qualifierId: number) {
    try {
      //NOTE: waiting type of this (undocumented) but works
      // const events: any[] = await this.osuService.getScores(matchId);
      const events = [
        {
          game: {
            scores: [
              {
                // femboy tummy
                user_id: 6304246,
                score: 1,
              },
              {
                // intercambing
                user_id: 2546001,
                score: 2,
              },
              {
                //chocomint
                user_id: 124493,
                score: 3,
              },
              {
                //Bocchi the Rock
                user_id: 11692602,
                score: 4,
              },
              {
                // maliszewski
                user_id: 12408961,
                score: 5,
              },
            ],
            beatmap: {
              id: 2719327,
              beatmapset_id: 1312076,
            },
          },
        },
        {
          game: {
            scores: [],
            beatmap: {
              id: 2571915,
              beatmapset_id: 1233444,
            },
          },
        },
      ];
      const isTeam = await this.qualifierService.isTeam(qualifierId);
      const matches = helpers.getParticipantsScore(events, isTeam);

      for await (const participantsScore of matches) {
        let res: ParticipantMapScore[] = [];
        let mapScoreId: number = null;
        for await (const participantScore of participantsScore) {
          const mapScore = await this.qualifierMapService.findOneByMapIds(
            participantScore.beatmapInfo.beatmapsetId,
            participantScore.beatmapInfo.id,
          );
          if (!mapScore) {
            continue;
          }
          mapScoreId = mapScore.id;

          const userId = await this.userService.findOneByOsuId(
            participantScore.osuId,
          );

          const participant = await this.qualifierParticipantService.findOne(
            userId,
            qualifierId,
          );

          // const participantMapScore = await this.participantsMapScore.findOne({
          //   where: {
          //     qualifierMapPlayedId: mapScore.id,
          //   },
          //   order: { rank: 'DESC' },
          // });

          if (!isTeam) {
            //NOTE: participant cannot set 2 scores on a map
            const duplicateParticipant =
              await this.participantsMapScore.findOne({
                where: {
                  participantId: participant.id,
                  qualifierMapPlayedId: mapScore.id,
                },
              });

            if (duplicateParticipant) {
              continue;
            }

            const createMapScore = await this.participantsMapScore
              .create({
                participantId: participant.id,
                score: participantScore.score,
                qualifierMapPlayedId: mapScore.id,
                qualifierId,
              })
              .save();
            res.push(createMapScore);
          } else {
            const participantMapScoreExist =
              await this.participantsMapScore.findOne({
                where: {
                  qualifierMapPlayedId: mapScore.id,
                  participantId: participant.id,
                },
                cache: false,
              });

            if (
              participantMapScoreExist &&
              participantMapScoreExist.participantsHadScoredIds.includes(userId)
            ) {
              console.log('includes');
              continue;
            }

            if (!participantMapScoreExist) {
              // create
              const createMapScore = await this.participantsMapScore
                .create({
                  participantId: participant.id,
                  score: participantScore.score,
                  qualifierMapPlayedId: mapScore.id,
                  qualifierId,
                  participantsHadScoredIds: [userId],
                })
                .save();
              res.push(createMapScore);
            } else {
              res = res.filter((t) => t.id !== participantMapScoreExist.id);

              participantMapScoreExist.participantsHadScoredIds.push(userId);
              participantMapScoreExist.score += participantScore.score;
              await participantMapScoreExist.save();
              res.push(participantMapScoreExist);
            }
          }
        }
        await this.assignRank(res, mapScoreId);
      }
      await this.qualifierParticipantService.updateSeed(qualifierId);
      return 'update successful';
    } catch (e) {
      throw new BadRequestException(
        e.message ? e.message : 'cannot start job',
        e,
      );
    }
  }

  async assignRank(mapsScored: ParticipantMapScore[], mapScoreId: number) {
    try {
      if (!mapsScored.length) return;
      const mapsScoredIds = mapsScored.map((mapScored) => mapScored.id);
      const qb = this.participantsMapScore.createQueryBuilder(
        'participantMapScore',
      );
      const otherMapsScored = await qb
        .where('participantMapScore.qualifierMapPlayedId = :mapScoreId', {
          mapScoreId,
        })
        .andWhere('participantMapScore.id NOT IN (:...mapsScoredIds)', {
          mapsScoredIds,
        })
        .getMany();

      const allMapsScored = otherMapsScored
        .concat(mapsScored)
        .sort((a, b) => b.score - a.score);
      let rank = -1;
      for await (const map of allMapsScored) {
        map.rank = rank += 1;
        await map.save();
        await this.qualifierParticipantService.updateAfterInsert(
          map.participantId,
          map.rank,
          map.score,
        );
      }
    } catch (e) {
      throw new BadRequestException(
        e.message ? e.message : 'cannot assign rank',
        e,
      );
    }
  }

  async findAllMapsScore(qualifierId: number) {
    return await this.participantsMapScore.find({ where: { qualifierId } });
  }
}
