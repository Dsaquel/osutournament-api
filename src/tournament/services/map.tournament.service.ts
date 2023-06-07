import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapType } from 'src/common/helper/types.helper';
import { OsuService } from 'src/osu/osu.service';
import { Repository } from 'typeorm';
import { TournamentMap } from '../entities/map/map.tournament.entity';

@Injectable()
export class TournamentMapService {
  constructor(
    @InjectRepository(TournamentMap)
    private readonly tournamentMaps: Repository<TournamentMap>,
    private readonly osuService: OsuService,
  ) {}

  async findByMappoolId(mappoolId: number) {
    try {
      return await this.tournamentMaps.findOne({
        where: { mappoolId },
      });
    } catch (e) {
      throw new NotFoundException('Not found the map');
    }
  }

  async create(
    type: MapType,
    mappoolId: number,
    tournamentId: number,
    beatmapId: number,
    beatmapsetId: number,
    numberOfType: number | undefined = 1,
  ): Promise<TournamentMap> {
    try {
      const map = await this.tournamentMaps.findOne({
        where: {
          tournamentId,
          beatmapId,
          beatmapsetId,
          type,
          mappoolId,
          numberOfType,
        },
      });
      if (map) {
        throw new ConflictException(
          'Map and mod already exist for this mappool',
        );
      }
      const osuBeatmap = await this.osuService.getBeatmap(beatmapId);
      if (!osuBeatmap || !osuBeatmap.url) {
        throw new ConflictException('This is not a beatmap');
      }
      return await this.tournamentMaps
        .create({
          beatmapId,
          mappoolId,
          tournamentId,
          beatmapsetId,
          type,
          osuBeatmap,
          numberOfType,
        })
        .save();
    } catch (e) {
      throw new ConflictException(e);
    }
  }

  async deleteOne(mappoolId: number, id: number) {
    try {
      const mapToDelete = await this.tournamentMaps.findOne({
        where: { mappoolId, id },
      });
      return await this.tournamentMaps.remove(mapToDelete);
    } catch (e) {
      throw new NotFoundException('cannot delete the map');
    }
  }

  async updateBeatmapData(mappoolId: number, id: number) {
    try {
      const mapTournament = await this.tournamentMaps.findOne({
        where: { mappoolId, id },
      });
      const osuBeatmap = await this.osuService.getBeatmap(
        mapTournament.beatmapId,
      );
      if (!osuBeatmap || !osuBeatmap.url) {
        throw new ConflictException('This is not a beatmap');
      }
      mapTournament.osuBeatmap = osuBeatmap;
      return await mapTournament.save();
    } catch (e) {
      throw new NotFoundException('cannot delete the map');
    }
  }
}
