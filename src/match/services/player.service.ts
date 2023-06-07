import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player/player.entity';
import { Repository } from 'typeorm';
import {
  IParticipantToPlayer,
  TParticipantToPlayer,
} from 'src/common/helper/types.helper';
import {
  Participant,
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
    @InjectRepository(Participant)
    private readonly participants: Repository<Participant>,
  ) {}

  async create(
    participant:
      | ParticipantIndividual
      | ParticipantTeam
      | IParticipantToPlayer
      | TParticipantToPlayer,
    tournamentId: number,
  ) {
    try {
      const participantToUpdate = await this.participants.findOne({
        where: { id: participant.id },
        loadEagerRelations: false,
        relations: { player: true },
      });
      const player = await this.players
        .create({
          seed: participant.qualifierParticipant.seed,
          tournamentId,
        })
        .save({ reload: true });
      participantToUpdate.player = player;
      return await participantToUpdate.save({ reload: true });
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot create', e);
    }
  }

  async findOneByUserId(userId: number) {
    try {
      return await this.participants
        .createQueryBuilder('participant')
        .leftJoin('participant.user', 'user')
        .leftJoin('participant.users', 'users')
        .where('user.id = :userId OR users.id = :userId', { userId })
        .getOne();
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot create', e);
    }
  }

  async findOne(id: number) {
    try {
      return await this.participants
        .createQueryBuilder('participant')
        .leftJoinAndSelect('participant.user', 'user')
        .leftJoinAndSelect('participant.users', 'users')
        .leftJoinAndSelect('participant.player', 'player', 'player.id = :id', {
          id,
        })
        .cache(false)
        .getOne();
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot create', e);
    }
  }
}
