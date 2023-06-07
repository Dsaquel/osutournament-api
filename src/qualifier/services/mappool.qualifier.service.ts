import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Qualifier } from '../entities/qualifier/qualifier.entity';
import { UpdateMappoolDto } from '../../common/dto/mappool.dto';
import { QualifierMappool } from 'src/common/entities/mappool.entity';

@Injectable()
export class QualifierMappoolService {
  constructor(
    @InjectRepository(QualifierMappool)
    private readonly mappoolsQualifier: Repository<QualifierMappool>,
  ) {}

  async findOneByQualifierId(qualifierId: number): Promise<QualifierMappool> {
    try {
      return await this.mappoolsQualifier.findOne({
        where: { qualifierId },
        order: { maps: { numberOfType: 'ASC' } },
      });
    } catch (e) {
      throw e;
    }
  }

  async findOne(id: QualifierMappool['id']): Promise<QualifierMappool> {
    try {
      return await this.mappoolsQualifier.findOne({
        where: { id },
      });
    } catch (e) {
      throw e;
    }
  }

  async findOneSelectTypes(
    id: QualifierMappool['id'],
  ): Promise<QualifierMappool> {
    return await this.mappoolsQualifier.findOne({
      where: { id },
    });
  }

  async create(qualifierId: Qualifier['id']): Promise<QualifierMappool> {
    try {
      return await this.mappoolsQualifier.create({ qualifierId }).save();
    } catch (e) {
      throw e;
    }
  }

  async update(
    mappool: QualifierMappool,
    updateMappoolDto: UpdateMappoolDto,
  ): Promise<QualifierMappool> {
    try {
      const qualifierMappool = await this.mappoolsQualifier.findOne({
        where: { id: mappool.id },
      });
      Object.assign(qualifierMappool, updateMappoolDto);
      return await qualifierMappool.save();
    } catch (e) {
      throw e;
    }
  }

  async updateOne(
    qualifierMappool: QualifierMappool,
    updateMappoolDto: UpdateMappoolDto,
  ) {
    try {
      Object.assign(qualifierMappool, updateMappoolDto);
      await qualifierMappool.save();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
