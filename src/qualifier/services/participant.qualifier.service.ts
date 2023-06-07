import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantType, TournamentType } from 'src/common/helper/enum.helper';
import {
  Participant,
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { User } from 'src/user/entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { QualifierParticipant } from '../entities/participant/participant.qualifier.entity';
import { Qualifier } from '../entities/qualifier/qualifier.entity';
import { QualifierService } from './qualifier.service';

@Injectable()
export class QualifierParticipantService {
  constructor(
    @InjectRepository(QualifierParticipant)
    private readonly participantsQualifier: Repository<QualifierParticipant>,
    @InjectRepository(ParticipantIndividual)
    private readonly participantIndividuals: Repository<ParticipantIndividual>,
    @InjectRepository(ParticipantTeam)
    private readonly participantTeams: Repository<ParticipantTeam>,
    @InjectRepository(Participant)
    private readonly participants: Repository<Participant>,
    private readonly qualifierService: QualifierService,
  ) {}

  async findOne(userId: User['id'], qualifierId: number) {
    const qualifier = await this.qualifierService.findOne(qualifierId);
    return qualifier.tournament.type === TournamentType.Solo
      ? await this.participantIndividuals.findOne({
          where: {
            validate: true,
            userId,
            qualifierParticipant: { qualifierId },
          },
        })
      : await this.participantTeams.findOne({
          where: {
            validate: true,
            users: { id: userId },
            qualifierParticipant: { qualifierId },
          },
        });
  }

  async findAllByQualifierId(qualifierId: number, take?: number) {
    try {
      return (await this.participants.find({
        where: {
          validate: true,
          qualifierParticipant: { qualifierId },
        },
        order: { qualifierParticipant: { seed: 'ASC' } },
        take,
      })) as (ParticipantIndividual | ParticipantTeam)[];
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot fetch', e);
    }
  }

  async create(
    participant: ParticipantIndividual | ParticipantTeam,
    qualifierId: Qualifier['id'],
  ) {
    try {
      if (participant instanceof ParticipantIndividual) {
        const participantIndividual = await this.participantIndividuals.findOne(
          { where: { id: participant.id } },
        );
        const qualifierParticipant = await this.participantsQualifier
          .create({ qualifierId })
          .save();
        participantIndividual.qualifierParticipant = qualifierParticipant;
        return await participantIndividual.save();
      }

      const participantTeam = await this.participantTeams.findOne({
        where: { id: participant.id },
      });
      const qualifierParticipant = await this.participantsQualifier
        .create({ qualifierId })
        .save();
      participantTeam.qualifierParticipant = qualifierParticipant;
      return await participantTeam.save();
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot create', e);
    }
  }

  async updateAfterInsert(
    id: number,
    rank: number,
    score: number,
  ): Promise<void> {
    try {
      const participant = await this.participants.findOne({
        where: { id },
      });
      const qualifierParticipant = await this.participantsQualifier.findOne({
        where: { id: participant.qualifierParticipant.id },
      });

      qualifierParticipant.totalScore += score;
      qualifierParticipant.totalRank += rank;

      await qualifierParticipant.save();
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot insert', e);
    }
  }

  async updateSeed(qualifierId: Qualifier['id']): Promise<void> {
    try {
      const participantsByRank = await this.participantsQualifier.find({
        where: { validate: true, qualifierId },
        order: {
          totalRank: 'ASC',
          totalScore: 'DESC',
        },
      });

      let i = 1;
      for await (const participantByRank of participantsByRank) {
        participantByRank.seed = i++;
        await participantByRank.save();
      }
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot update', e);
    }
  }
}
