import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Like, Repository } from 'typeorm';
import { CreateUser } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findOne(id: number) {
    try {
      return await this.users.findOne({ where: { id } });
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async createOrUpdateUser(createUser: CreateUser): Promise<User> {
    const user = await this.users.findOne({
      where: { osuId: createUser.osuId },
    });
    if (user) {
      return this.users.save({ id: user.id, ...createUser });
    }
    const createInstance = this.users.create(createUser);
    return await createInstance.save();
  }

  async findOneByOsuId(osuId: number): Promise<User['id']> {
    try {
      return (await this.users.findOne({ where: { osuId } })).id;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async findCurrent(id: number, osuId: number): Promise<User> {
    try {
      return await this.users.findOne({
        where: { id, osuId },
      });
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async findOneWithNotification(id: number) {
    try {
      return await this.users
        .createQueryBuilder('user')
        .leftJoinAndSelect(
          'user.invitationsFromTeams',
          'invitation',
          'invitation.status = :status',
          { status: 'pending' },
        )
        .leftJoinAndSelect('invitation.tournament', 'tournament')
        .where('user.id = :id', { id })
        .andWhere(
          new Brackets((qb) => {
            qb.where('invitation.status = :status', {
              status: 'pending',
            }).orWhere('invitation.id IS NULL');
          }),
        )
        .andWhere(
          new Brackets((qb) => {
            qb.where('tournament.id IS NULL').orWhere(
              'tournament.registrationEnd = :registrationEnd',
              { registrationEnd: false },
            );
          }),
        )
        .select([
          'user.avatarUrl',
          'user.createAt',
          'user.discord',
          'user.id',
          'user.username',
          'user.osuId',
          'user.rank',
          'user.updateAt',
          'invitation.id',
          'invitation.status',
          'invitation.tournamentId',
          'invitation.participantTeamId',
          'tournament.name',
          'participantTeam.name',
        ])
        .leftJoinAndSelect('invitation.participantTeam', 'participantTeam')
        .getOne();
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }

  async finUsersByUsername(username: string) {
    try {
      return await this.users.find({
        where: { username: Like(`%${username}%`) },
      });
    } catch (e) {
      console.log(e);
    }
  }
}
