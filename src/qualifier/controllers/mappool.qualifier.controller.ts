import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QualifierMappoolService } from '../services/mappool.qualifier.service';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';
import { UpdateMappoolDto } from '../../common/dto/mappool.dto';
import { MappoolInterceptor } from '../interceptors/mappool.interceptor';
import { QualifierMappool } from 'src/common/entities/mappool.entity';

@Controller('qualifier')
export class QualifierMappoolController {
  constructor(
    private readonly qualifierMappoolService: QualifierMappoolService,
  ) {}

  @Get(':qualifierId/mappool')
  @UseGuards(LoggedInGuard)
  async findByQualifierId(@Param('qualifierId') qualifierId: string) {
    try {
      return await this.qualifierMappoolService.findOneByQualifierId(
        +qualifierId,
      );
    } catch (e) {
      throw e;
    }
  }

  @Get('mappool/:id')
  @UseGuards(LoggedInGuard)
  async findOne(@Param('id') mappoolId: string): Promise<QualifierMappool> {
    return await this.qualifierMappoolService.findOne(+mappoolId);
  }

  @Put('mappool/:id')
  @UseGuards(LoggedInGuard)
  @UseInterceptors(MappoolInterceptor)
  async update(
    @Body('mappool') mappool: QualifierMappool,
    @Body('body') updateQualifierMappoolDto: UpdateMappoolDto,
  ): Promise<QualifierMappool> {
    return this.qualifierMappoolService.update(
      mappool,
      updateQualifierMappoolDto,
    );
  }

  @Put(':qualifierId/mappools/:mappoolId')
  async updateMappool(
    @Param('qualifierId') qualifierId: string,
    @Param('mappoolId') mappoolId: string,
    @Body() updateMappoolDto: UpdateMappoolDto,
  ) {
    const mappool = await this.qualifierMappoolService.findOne(+mappoolId);
    await this.qualifierMappoolService.updateOne(mappool, updateMappoolDto);
    return await this.qualifierMappoolService.findOneByQualifierId(
      +qualifierId,
    );
  }
}
