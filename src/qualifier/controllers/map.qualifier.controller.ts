import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MapsOutput } from '../dto/map.qualifier.dto';
import { QualifierMapService } from '../services/map.qualifier.service';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';
import { MapInterceptor } from '../interceptors/map.interceptor';

@Controller('qualifier')
export class QualifierMapController {
  constructor(private readonly qualifierMapService: QualifierMapService) {}

  @Get(':qualifierId/map')
  findAllMaps(@Param('qualifierId') qualifierId: string) {
    return this.qualifierMapService.findAllMaps(+qualifierId);
  }

  @Post('/map:id')
  @UseGuards(LoggedInGuard)
  @UseInterceptors(MapInterceptor)
  async create(
    @Param('id') id: string,
    @Body() mapsQualifierDto: MapsOutput,
  ): Promise<any> {
    return await this.qualifierMapService.create(
      +id,
      mapsQualifierDto.mapsOutput,
    );
  }
}
