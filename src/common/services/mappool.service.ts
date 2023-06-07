import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mappool } from 'src/common/entities/mappool.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MappoolService {
  constructor(
    @InjectRepository(Mappool)
    private readonly mappools: Repository<Mappool>,
  ) {}

  async findOne(id: number): Promise<Mappool> {
    try {
      return await this.mappools.findOne({ where: { id } });
    } catch (e) {
      throw new NotFoundException(e, "Didn't find the mappool");
    }
  }

  async updateMappoolShow(id: number): Promise<void> {
    try {
      const mappool = await this.mappools.findOne({ where: { id } });
      mappool.isVisible = true;
      await mappool.save();
    } catch (e) {
      throw e;
    }
  }
}
