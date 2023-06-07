import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { QualifierMap } from '../entities/map/map.qualifier.entity';
import { QualifierMapDto } from '../dto/map.qualifier.dto';
import { Mappool, QualifierMappool } from 'src/common/entities/mappool.entity';
import { QualifierMappoolService } from './mappool.qualifier.service';
import { MapType } from 'src/common/helper/types.helper';
import { OsuService } from 'src/osu/osu.service';

@Injectable()
export class QualifierMapService {
  constructor(
    @InjectRepository(QualifierMap)
    private readonly qualifierMaps: Repository<QualifierMap>,
    private readonly qualifierMappoolService: QualifierMappoolService,
    private readonly osuService: OsuService,
  ) {}

  async findByMappoolId(mappoolId: Mappool['id']): Promise<QualifierMap[]> {
    try {
      return await this.qualifierMaps.find({
        where: { mappoolId },
        select: {
          id: true,
          type: true,
          beatmapsetId: true,
          beatmapId: true,
        },
      });
    } catch (e) {
      return e;
    }
  }

  async findOneById(id: QualifierMap['id']): Promise<QualifierMap> {
    return await this.qualifierMaps.findOne({ where: { id } });
  }

  async findOneByMapIds(
    beatmapsetId: number,
    beatmapId: number,
  ): Promise<QualifierMap> {
    return await this.qualifierMaps.findOne({
      where: { beatmapsetId, beatmapId },
    });
  }

  async findAllMaps(qualifierId: number) {
    try {
      return await this.qualifierMaps.find({
        where: {
          qualifierId,
          participantsMapPlayed: {
            participant: { qualifierParticipant: { validate: true } },
          },
        },
        relations: { participantsMapPlayed: { participant: true } },
        order: { numberOfType: 'ASC' },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async findOneBySecondIdType(
    beatmapsetId: number,
    beatmapId: number,
    type: MapType,
  ): Promise<QualifierMap> {
    try {
      return await this.qualifierMaps.findOne({
        where: { beatmapsetId, beatmapId, type },
      });
    } catch (e) {
      return e;
    }
  }

  async create(
    id: QualifierMappool['id'],
    qualifierMapsDto: QualifierMapDto[],
  ): Promise<QualifierMappool> {
    //NOTE: saving relation by his id
    for await (const qualifierMapDto of qualifierMapsDto) {
      if (qualifierMapDto.id) {
        await this.qualifierMaps.save(qualifierMapDto);
      }
      const mapExisted = await this.findOneBySecondIdType(
        qualifierMapDto.beatmapsetId,
        qualifierMapDto.beatmapId,
        qualifierMapDto.type,
      );
      if (mapExisted) continue;
      const payload = Object.assign(
        { mappool: { id }, mappoolId: id },
        qualifierMapDto,
      );
      await this.qualifierMaps.save(payload);
    }
    return await this.qualifierMappoolService.findOne(id);
  }

  async addOne(
    type: MapType,
    mappoolId: number,
    qualifierId: number,
    beatmapId: number,
    beatmapsetId: number,
    numberOfType: number | undefined = 1,
  ) {
    try {
      const map = await this.qualifierMaps.findOne({
        where: {
          qualifierId,
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
      return await this.qualifierMaps
        .create({
          beatmapId,
          mappoolId,
          qualifierId,
          beatmapsetId,
          type,
          osuBeatmap,
          numberOfType,
        })
        .save();
    } catch (e) {
      throw new ConflictException('cannot insert map');
    }
  }

  async deleteOne(mappoolId: number, id: number) {
    try {
      const mapToDelete = await this.qualifierMaps.findOne({
        where: { mappoolId, id },
      });
      return await this.qualifierMaps.remove(mapToDelete);
    } catch (e) {
      throw new NotFoundException('cannot delete the map');
    }
  }

  async updateBeatmapData(mappoolId: number, id: number) {
    try {
      const mapTournament = await this.qualifierMaps.findOne({
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
