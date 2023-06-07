import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../entities/tournament/tournament.entity';
import { User } from '../../user/entities/user.entity';
import { Mappooler } from '../entities/mappool/mappooler.entity';

@Injectable()
export class MappoolerService {
  constructor(
    @InjectRepository(Mappooler)
    private readonly mappoolers: Repository<Mappooler>,
  ) {}

  async findAll(tournamentId: number) {
    return await this.mappoolers.find({
      where: { tournamentId },
    });
  }

  async findAllValidate(tournamentId: number) {
    return await this.mappoolers.find({
      where: { tournamentId, validate: true },
    });
  }
  async findOne(tournamentId: number, id: number) {
    return await this.mappoolers.findOne({ where: { id, tournamentId } });
  }

  async create(
    tournamentId: number,
    userId: number,
    validate: boolean = false,
  ) {
    try {
      const mappooler = await this.mappoolers.findOne({
        where: { userId, tournamentId },
      });
      if (mappooler) {
        throw new ConflictException({
          message:
            'you have already participate to this tournament, please wait admins validate you',
          template: true,
        });
      }
      await this.mappoolers.create({ userId, tournamentId, validate }).save();
      return {
        message: !validate
          ? 'well done ! please wait the owner or admins validate you'
          : `new role added`,
        subject: 'mappooler',
      };
    } catch (e) {
      throw e;
    }
  }

  async ownerAsMappooler(tournament: Tournament, user: User): Promise<void> {
    const ownerAsMappooler = this.mappoolers.create();
    ownerAsMappooler.tournamentId = tournament.id;
    ownerAsMappooler.tournament = { ...(tournament as any) };
    ownerAsMappooler.userId = user.id;
    ownerAsMappooler.user = { ...(user as any) };
    ownerAsMappooler.validate = true;
    await ownerAsMappooler.save();
  }

  async update(tournament: Tournament, userId: User['id'], validate: boolean) {
    const mappooler = await this.mappoolers.findOne({
      where: {
        tournamentId: tournament.id,
        userId: userId,
      },
    });
    if (!mappooler)
      throw new NotFoundException(
        'Please add this mappooler before validate him',
      );
    mappooler.validate = validate;
    return await this.mappoolers.save(mappooler);
  }

  async findByIds(
    tournamentId: number,
    userId: number,
    validate: boolean = undefined,
  ) {
    if (validate === undefined)
      return await this.mappoolers.findOne({ where: { tournamentId, userId } });
    return await this.mappoolers.findOne({
      where: { tournamentId, userId, validate },
    });
  }

  async validateMappooler(tournamentId: number, id: number) {
    const mappooler = await this.mappoolers.findOne({
      where: { tournamentId, id },
    });
    if (!mappooler) throw new NotFoundException('cannot find mappooler');
    mappooler.validate = true;
    await mappooler.save();
  }

  async removeMappooler(tournamentId: number, id: number) {
    const mappooler = await this.mappoolers.findOne({
      where: { tournamentId, id },
    });
    if (!mappooler) throw new NotFoundException('cannot find mappooler');
    await this.mappoolers.remove(mappooler);
  }

  async removeMappoolerUnValidateByUserId(
    tournamentId: number,
    userId: number,
  ) {
    const mappooler = await this.mappoolers.findOne({
      where: { tournamentId, userId, validate: false },
    });
    if (!mappooler) return;
    await this.mappoolers.remove(mappooler);
  }
}
