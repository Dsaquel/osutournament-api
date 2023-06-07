import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../entities/tournament/tournament.entity';
import { User } from '../../user/entities/user.entity';
import { Referee } from '../entities/referee/referee.entity';
import { SuperReferee } from '../entities/referee/super.referee.entity';

@Injectable()
export class RefereeService {
  constructor(
    @InjectRepository(Referee)
    private readonly referees: Repository<Referee>,
    @InjectRepository(SuperReferee)
    private readonly superReferees: Repository<SuperReferee>,
  ) {}

  async findAll(tournamentId: number) {
    try {
      return await this.referees.find({ where: { tournamentId } });
    } catch (e) {
      throw e;
    }
  }

  async findAllValidate(tournamentId: number) {
    return await this.referees.find({
      where: { tournamentId, validate: true },
    });
  }

  async findOne(tournamentId: number, id: number) {
    return await this.referees.findOne({ where: { id, tournamentId } });
  }

  async create(
    tournamentId: number,
    userId: number,
    validate: boolean = false,
  ) {
    try {
      const referee = await this.referees.findOne({
        where: { userId, tournamentId },
      });
      if (referee) {
        throw new ConflictException(
          'you have already participate to this tournament, please wait admins validate you',
        );
      }
      await this.referees.create({ userId, tournamentId, validate }).save();
      return {
        message: !validate
          ? 'well done ! please wait the owner or admins validate you'
          : `new role added`,
        subject: 'referee',
      };
    } catch (e) {
      throw e;
    }
  }

  async update(tournament: Tournament, userId: User['id'], validate: boolean) {
    const referee = await this.referees.findOne({
      where: {
        tournamentId: tournament.id,
        userId: userId,
      },
    });
    if (!referee)
      throw new NotFoundException(
        'Please add this referee before validate him',
      );
    referee.validate = validate;
    return await this.referees.save(referee);
  }

  async findByIds(
    tournamentId: number,
    userId: number,
    validate: boolean = undefined,
  ) {
    if (validate === undefined)
      return await this.referees.findOne({ where: { tournamentId, userId } });
    return await this.referees.findOne({
      where: { tournamentId, userId, validate },
    });
  }

  async validateReferee(tournamentId: number, id: number) {
    const referee = await this.referees.findOne({
      where: { tournamentId, id },
    });
    if (!referee) throw new NotFoundException('cannot find referee');
    referee.validate = true;
    await referee.save();
  }

  async removeReferee(tournamentId: number, id: number) {
    const referee = await this.referees.findOne({
      where: { tournamentId, id },
    });
    if (!referee) throw new NotFoundException('cannot find referee');
    await this.referees.remove(referee);
  }

  async removeRefereeUnValidateByUserId(tournamentId: number, userId: number) {
    const referee = await this.referees.findOne({
      where: { tournamentId, userId, validate: false },
    });
    if (!referee) return;
    await this.referees.remove(referee);
  }
}
