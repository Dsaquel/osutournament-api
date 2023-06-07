import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TournamentType } from 'src/common/helper/enum.helper';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { Repository } from 'typeorm';
import { Qualifier } from '../entities/qualifier/qualifier.entity';
import { QualifierMappoolService } from './mappool.qualifier.service';

@Injectable()
export class QualifierService {
  constructor(
    @InjectRepository(Qualifier)
    private readonly qualifiers: Repository<Qualifier>,
    private readonly qualifierMappoolService: QualifierMappoolService,
  ) {}

  async create(tournament: Tournament) {
    try {
      const qualifier = await this.qualifiers
        .create({
          tournamentId: tournament.id,
        })
        .save();
      const mappool = await this.qualifierMappoolService.create(qualifier.id);
      qualifier.mappool = mappool;
      await qualifier.save();
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: Qualifier['id']): Promise<Qualifier> {
    try {
      return await this.qualifiers.findOne({
        where: { id },
        relations: {
          participants: true,
          mappool: true,
          mappoolers: true,
          tournament: true,
          lobbies: true,
        },
      });
    } catch (e) {
      return e;
    }
  }

  async findOneByTournamantId(
    tournamentId: Tournament['id'],
  ): Promise<Qualifier> {
    try {
      return await this.qualifiers.findOne({
        where: { tournamentId },
      });
    } catch (e) {
      throw e;
    }
  }

  async createOrUpdate(
    tournamentId: number,
    tournament: Tournament,
    hasQualifier: boolean,
  ) {
    try {
      const qualifier = await this.qualifiers.findOne({
        where: { tournamentId },
      });
      if (qualifier && !hasQualifier) {
        if (tournament.hasQualifier) await this.qualifiers.remove(qualifier);
      } else {
        if (!qualifier && hasQualifier) {
          await this.create(tournament);
        }
      }
    } catch (e) {
      throw e;
    }
  }

  async isTeam(id: number) {
    try {
      return TournamentType.Team === (await this.findOne(+id)).tournament.type;
    } catch (e) {
      console.log(e);
    }
  }
}
