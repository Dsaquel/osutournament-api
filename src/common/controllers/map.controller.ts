import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { QualifierMapService } from 'src/qualifier/services/map.qualifier.service';
import { TournamentMapService } from '../../tournament/services/map.tournament.service';
import { CreateMapDto } from '../dto/map.dto';

@Controller()
export class MapController {
  constructor(
    private readonly tournamentMapService: TournamentMapService,
    private readonly qualifierMapService: QualifierMapService,
  ) {}

  @Post('mappool/:mappoolId/map')
  async addMap(
    @Param('mappoolId') mappoolId: string,
    @Body() createMapDto: CreateMapDto,
  ) {
    if (createMapDto.tournamentId) {
      return await this.tournamentMapService.create(
        createMapDto.type,
        +mappoolId,
        createMapDto.tournamentId,
        createMapDto.beatmapId,
        createMapDto.beatmapsetId,
        createMapDto.numberOfType,
      );
    } else {
      if (createMapDto.qualifierId) {
        return await this.qualifierMapService.addOne(
          createMapDto.type,
          +mappoolId,
          createMapDto.qualifierId,
          createMapDto.beatmapId,
          createMapDto.beatmapsetId,
          createMapDto.numberOfType,
        );
      }
    }
  }

  @Put('mappool/:mappoolId/map/:mapId')
  async updateBeatmapData(
    @Param('mappoolId') mappoolId: string,
    @Param('mapId') mapId: string,
    @Body() body: { tournamentId?: number; qualifierId?: number },
  ) {
    if (body.tournamentId) {
      await this.tournamentMapService.updateBeatmapData(+mappoolId, +mapId);
      return 'beatmap updated';
    } else {
      if (body.qualifierId) {
        await this.qualifierMapService.updateBeatmapData(+mappoolId, +mapId);
        return 'beatmap deleted';
      }
    }
  }

  @Delete('mappool/:mappoolId/map/:mapId')
  async deleteMap(
    @Param('mappoolId') mappoolId: string,
    @Param('mapId') mapId: string,
    @Body() body: { tournamentId?: number; qualifierId?: number },
  ) {
    if (body.tournamentId) {
      await this.tournamentMapService.deleteOne(+mappoolId, +mapId);
      return 'map deleted';
    } else {
      if (body.qualifierId) {
        await this.qualifierMapService.deleteOne(+mappoolId, +mapId);
        return 'map deleted';
      }
    }
  }
}
