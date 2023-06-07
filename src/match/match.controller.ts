import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { MatchService } from './services/match.service';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';
import { UpdateMatchDto } from './dto/match.dto';
import { CreateRescheduleDto } from './dto/reschedule.dto';
import { Request } from 'express';
import { PlayerService } from './services/player.service';
import { User } from 'src/user/entities/user.entity';
import { LobbyService } from 'src/qualifier/services/lobby.service';

@Controller('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly playerService: PlayerService,
    private readonly lobbyService: LobbyService,
  ) {}

  @Get(':id/win/:round')
  findWinner(@Param('id') id: string, @Param('round') round: string) {
    return this.matchService.getWinnerBracket(+id, +round);
  }

  @Get(':id/lose/:round')
  findLoser(@Param('id') id: string, @Param('round') round: string) {
    return this.matchService.getLoserBracket(+id, +round);
  }

  @UseGuards(LoggedInGuard)
  @Put(':id')
  async updateMatch(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() udpateMatchDto: UpdateMatchDto,
  ) {
    const match = await this.matchService.findOne(+id);
    const { relationType, relationId } = await this.lobbyService.findRelation(
      undefined,
      (req.user as User).id,
      match.tournamentId,
    );

    let superReferee = await this.lobbyService.findSuperReferee(
      relationType,
      relationId,
    );

    if (!superReferee) {
      superReferee = await this.lobbyService.createSuperReferee(
        relationType,
        relationId,
      );
    }

    return await this.matchService.updateMatch(
      match,
      superReferee,
      udpateMatchDto,
    );
  }

  @UseGuards(LoggedInGuard)
  @Post(':id/reschedule')
  async createReschedule(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() createRescheduleDto: CreateRescheduleDto,
  ) {
    const player = await this.playerService.findOneByUserId(
      5, // TODO: for prod set req.user.id
    );

    return await this.matchService.createReschedule(
      +id,
      player.id,
      createRescheduleDto,
    );
  }

  @UseGuards(LoggedInGuard)
  @Post(':id/referee')
  async addOrRemoveReferee(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('undo') undo?: boolean,
  ) {
    const match = await this.matchService.findOne(+id);
    const { relationType, relationId } = await this.lobbyService.findRelation(
      undefined,
      (req.user as User).id,
      match.tournamentId,
    );

    let superReferee = await this.lobbyService.findSuperReferee(
      relationType,
      relationId,
    );

    if (!superReferee) {
      superReferee = await this.lobbyService.createSuperReferee(
        relationType,
        relationId,
      );
    }

    return await this.matchService.addOrRemoveReferee(
      +id,
      superReferee.id,
      undo,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchService.findOne(+id);
  }

  @Get()
  async findAllByTournamentId(@Query('tournamentId') tournamentId: string) {
    return await this.matchService.findAllByTournamentId(+tournamentId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchService.remove(+id);
  }
}
