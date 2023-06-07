import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ParticipantMapScoreService } from '../services/participant.map.score.service';
import { MapScoreDto } from '../dto/map.score.dto';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';

@Controller('qualifier/:qualifierId/score')
export class ParticipantMapScoreController {
  constructor(
    private readonly participantMapScoreService: ParticipantMapScoreService,
  ) {}

  @UseGuards(LoggedInGuard)
  @Put()
  async create(
    @Body() mapScoreDto: MapScoreDto,
    @Param('qualifierId') qualifierId: string,
  ) {
    return await this.participantMapScoreService.create(
      mapScoreDto.matchId,
      +qualifierId,
    );
  }

  @UseGuards(LoggedInGuard)
  @Get()
  async findAllScore(@Param('qualifierId') qualifierId: string) {
    return await this.participantMapScoreService.findAllMapsScore(+qualifierId);
  }
}
