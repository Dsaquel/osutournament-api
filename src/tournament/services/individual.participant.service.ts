import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipantIndividual } from '../entities/participant/participant.entity';
import { IParticipantToPlayer } from 'src/common/helper/types.helper';
import * as helpers from 'src/match/helpers/functions';

@Injectable()
export class ParticipantIndividualService {
  constructor(
    @InjectRepository(ParticipantIndividual)
    private readonly participantIndividuals: Repository<ParticipantIndividual>,
  ) {}

  async findAll(tournamentId: number) {
    try {
      return await this.participantIndividuals.find({
        where: { tournamentId },
      });
    } catch (e) {
      throw new NotFoundException('cannot find participants');
    }
  }

  async create(userId: number, tournamentId: number) {
    try {
      const participant = await this.participantIndividuals.findOne({
        where: { tournamentId, userId },
        relations: {
          user: true,
        },
      });

      if (participant) {
        throw new ConflictException(
          `${participant.user.username} already exist`,
        );
      }
      await this.participantIndividuals.create({ userId, tournamentId }).save();
      return {
        subject: 'Congrat !',
        message: `You are added to this tournament`,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findParticipantsWithSeed(
    tournamentId: number,
    numbersPlayers: number,
  ): Promise<IParticipantToPlayer[]> {
    try {
      const participants = await this.participantIndividuals.find({
        where: { tournamentId, validate: true },
        take: numbersPlayers,
      });

      const participantsOutput: IParticipantToPlayer[] = [];
      const seeding = helpers.shuffleArray(helpers.getSeeding(numbersPlayers));
      //TODO: get by pp score
      for (let i = 1; i <= numbersPlayers; i++) {
        const participantOutput: IParticipantToPlayer = Object.assign(
          participants[i - 1],
          { seed: seeding.shift() },
        );
        participantsOutput.push(participantOutput);
      }
      return participantsOutput;
    } catch (e) {
      throw new BadRequestException(
        e.message ? e : 'cannot find participants with seed',
        e,
      );
    }
  }

  async removeByUserId(userId: number, tournamentId: number) {
    const participant = await this.participantIndividuals.findOne({
      where: { tournamentId, userId },
    });
    if (!participant) return;
    await this.participantIndividuals.remove(participant);
  }

  async udpateValidation(id: number, tournamentId: number, validate: boolean) {
    const participant = await this.participantIndividuals.findOne({
      where: { tournamentId, id },
    });
    if (!participant) throw new NotFoundException('cannot find participant');
    participant.validate = validate;
    await participant.save();
    return {
      subject: 'Participant',
      message: validate ? `Participant validate` : `Participant unvalidate`,
    };
  }
}
