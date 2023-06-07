import {
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Qualifier } from '../entities/qualifier/qualifier.entity';
import { QualifierService } from '../services/qualifier.service';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';
import { Action } from 'src/ability/ability.factory';
import { CheckTournamentAbility } from 'src/ability/ability.decorator';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { QualifierParticipantService } from '../services/participant.qualifier.service';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { MatchService } from 'src/match/services/match.service';
import { LobbyService } from '../services/lobby.service';
import { User } from 'src/user/entities/user.entity';
import { Request } from 'express';

@Controller('qualifier')
export class QualifierController {
  constructor(
    private readonly qualifierService: QualifierService,
    private readonly qualifierParticipantService: QualifierParticipantService,
    private readonly matchService: MatchService,
    private readonly tournamentService: TournamentService,
    private readonly lobbyService: LobbyService,
  ) {}

  @UseGuards(LoggedInGuard)
  @CheckTournamentAbility({ action: Action.PrivateRead, subject: Tournament })
  @Get()
  async findOneByTournamentId(
    @Query('tournamentId') tournamentId: string,
  ): Promise<Qualifier> {
    return await this.qualifierService.findOneByTournamantId(+tournamentId);
  }

  @UseGuards(LoggedInGuard)
  @Get(':qualifierId/participant/ranking')
  async findParticipantRanking(@Param('qualifierId') qualifierId: string) {
    return await this.qualifierParticipantService.findAllByQualifierId(
      +qualifierId,
    );
  }

  @UseGuards(LoggedInGuard)
  @Put(':qualifierId/finished')
  async passQualifierToFinished(
    @Req() req: Request,
    @Param('qualifierId') qualifierId: string,
    @Query('tournamentId') tournamentId: string,
  ) {
    await this.lobbyService.adminGuard(+qualifierId, (req.user as User).id);
    const tournament = await this.tournamentService.findOne(+tournamentId);
    await this.tournamentService.updateBracketPhase(+tournamentId);
    const qualifierParticipants =
      await this.qualifierParticipantService.findAllByQualifierId(
        +qualifierId,
        tournament.numbersPlayers,
      );
    await this.matchService.addPlayers(
      +tournamentId,
      tournament.numbersPlayers,
      qualifierParticipants,
    );
    return {
      subject: 'Passing in bracket phase',
      message: `Tournament passed in bracket phase`,
    };
  }
}
