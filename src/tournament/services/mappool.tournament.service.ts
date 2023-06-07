import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateMappoolDto, UpdateMappoolDto } from '../dto/mappool.dto';
import { TournamentMappool } from 'src/common/entities/mappool.entity';

@Injectable()
export class TournamentMappoolService {
  constructor(
    @InjectRepository(TournamentMappool)
    private readonly mappoolsTournament: Repository<TournamentMappool>,
  ) {}

  async findAllByTournamentId(tournamentId: number) {
    try {
      return await this.mappoolsTournament.find({
        where: { tournamentId },
        order: { maps: { numberOfType: 'ASC' } },
      });
    } catch (e) {
      throw e;
    }
  }

  async findOneByTournamentId(tournamentId: number) {
    return await this.mappoolsTournament.findOne({ where: { tournamentId } });
  }

  async findOneById(id: number) {
    try {
      return await this.mappoolsTournament.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async createMultiple(
    tournamentId: number,
    createMappoolDto: CreateMappoolDto,
  ) {
    try {
      for await (const round of createMappoolDto.rounds) {
        const mappool = await this.mappoolsTournament.findOne({
          where: {
            round,
            tournamentId,
          },
        });
        if (mappool) continue;
        await this.mappoolsTournament
          .create({
            round,
            displayMappoolsSchedule: createMappoolDto.displayMappoolsSchedule,
            isVisible: createMappoolDto.isVisible,
            tournamentId,
          })
          .save();
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async updateMappoolsNumber(tournamentId: number, roundsToSave: number[]) {
    try {
      const mappoolsToDelete = await this.mappoolsTournament.find({
        where: { tournamentId, round: Not(In(roundsToSave)) },
      });

      await this.mappoolsTournament.remove(mappoolsToDelete);
    } catch (e) {
      throw e;
    }
  }

  async updateOne(
    tournamentMappool: TournamentMappool,
    updateMappoolDto: UpdateMappoolDto,
  ) {
    try {
      Object.assign(tournamentMappool, updateMappoolDto);
      await tournamentMappool.save();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async removeOne(tournamentId: number, id: number) {
    try {
      await (
        await this.mappoolsTournament.findOne({ where: { tournamentId, id } })
      ).remove();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
