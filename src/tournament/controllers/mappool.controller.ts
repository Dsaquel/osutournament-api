import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TournamentMappoolService } from '../services/mappool.tournament.service';
import { CreateMappoolDto, UpdateMappoolDto } from '../dto/mappool.dto';

@Controller('tournament')
export class TournamentMappoolController {
  constructor(
    private readonly tournamentMappoolService: TournamentMappoolService,
  ) {}

  @Get(':tournamentId/mappools')
  async findAllMappool(@Param('tournamentId') id: string) {
    return await this.tournamentMappoolService.findAllByTournamentId(+id);
  }

  @Post(':tournamentId/mappools')
  async createMappool(
    @Param('tournamentId') tournamentId: string,
    @Body() createMappoolDto: CreateMappoolDto,
  ) {
    await this.tournamentMappoolService.createMultiple(
      +tournamentId,
      createMappoolDto,
    );
    return await this.tournamentMappoolService.findAllByTournamentId(
      +tournamentId,
    );
  }

  @Put(':tournamentId/mappools/:mappoolId')
  async updateMappool(
    @Param('tournamentId') tournamentId: string,
    @Param('mappoolId') mappoolId: string,
    @Body() updateMappoolDto: UpdateMappoolDto,
  ) {
    const mappool = await this.tournamentMappoolService.findOneById(+mappoolId);
    await this.tournamentMappoolService.updateOne(mappool, updateMappoolDto);
    return await this.tournamentMappoolService.findAllByTournamentId(
      +tournamentId,
    );
  }

  @Delete(':tournamentId/mappools/:mappoolId')
  async deleteMappool(
    @Param('tournamentId') tournamentId: string,
    @Param('mappoolId') mappoolId: string,
  ) {
    await this.tournamentMappoolService.removeOne(+tournamentId, +mappoolId);
    return await this.tournamentMappoolService.findAllByTournamentId(
      +tournamentId,
    );
  }
}
