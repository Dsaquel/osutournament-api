import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  UseInterceptors,
  Req,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { TournamentService } from '../services/tournament.service';
import { LoggedInGuard } from '../../auth/guards/logged-in.guard';
import { Tournament } from '../entities/tournament/tournament.entity';
import { Action } from 'src/ability/ability.factory';
import { CheckTournamentAbility } from 'src/ability/ability.decorator';
import { DateInterceptor } from '../interceptors/date.interceptor';
import { TournamentStartDateJob } from '../jobs/start.tournament.job';
import { MatchService } from 'src/match/services/match.service';
import { QualifierService } from 'src/qualifier/services/qualifier.service';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { AddingStaffDto } from '../dto/adding-staff.dto';
import { TournamentMappoolService } from '../services/mappool.tournament.service';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { RefereeService } from '../services/referee.service';
import { MappoolerService } from '../services/mappooler.service';
import { PlayerService } from 'src/match/services/player.service';
import { UpdatePublication } from '../dto/draft.dto';
import { TournamentType } from 'src/common/helper/enum.helper';
import { ParticipantIndividualService } from '../services/individual.participant.service';
import { ParticipantTeamService } from '../services/team.participant.service';
import { ParticipantInterceptor } from '../interceptors/participant.interceptor';
import { AddParticipantTeamDto } from '../dto/create-team-dto';
import { UserService } from 'src/user/user.service';

@Controller('tournament')
export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly qualifierService: QualifierService,
    private readonly matchService: MatchService,
    private readonly tournamentMappoolService: TournamentMappoolService,
    private readonly tournamentStartDateJob: TournamentStartDateJob,
    private readonly refereeService: RefereeService,
    private readonly mappoolerService: MappoolerService,
    private readonly participantIndividualService: ParticipantIndividualService,
    private readonly participantTeamService: ParticipantTeamService,
    private readonly userService: UserService,
    private readonly playerService: PlayerService,
  ) {}

  @Get()
  findAll() {
    return this.tournamentService.findAll();
  }

  @UseGuards(LoggedInGuard)
  @Get(':tournamentId/control-access')
  async conrolAccess(@Param('tournamentId') id: string, @Req() req: Request) {
    return await this.tournamentService.controlAccess(
      +id,
      (req.user as User).id,
    );
  }

  @Get(':tournamentId/staff')
  async findStaff(@Param('tournamentId') id: string) {
    return await this.tournamentService.findStaff(+id);
  }

  @Get(':tournamentId/own-participation')
  async ownParticipation(
    @Param('tournamentId') id: string,
    @Req() req: Request,
  ) {
    return await this.tournamentService.participationOfUser(
      +id,
      (req.user as User).id,
    );
  }

  @CheckTournamentAbility({ action: Action.PrivateRead, subject: Tournament })
  @Get(':tournamentId')
  async findOne(@Param('tournamentId') id: string): Promise<Tournament> {
    return await this.tournamentService.findOne(+id);
  }

  /**
   *
   * we need a date here
   */
  @Post(':id/start')
  @UseGuards(LoggedInGuard)
  @UseInterceptors(DateInterceptor)
  async startTournament(@Param('id') id: string) {
    await this.tournamentStartDateJob.startJob(+id);
    return 'ok';
  }

  @Get(':id/player/:playerId')
  async findWinner(@Param('playerId') playerId: string) {
    return await this.playerService.findOne(+playerId);
  }

  @UseGuards(LoggedInGuard)
  @Post(':id/participant/individual')
  @UseInterceptors(DateInterceptor, ParticipantInterceptor)
  async createIndividualParticipant(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const tournament = await this.tournamentService.findOne(+id);
    (req.user as User).id = 5;
    (req.user as User).rank = 16;
    return await this.participantIndividualService.create(
      (req.user as User).id,
      tournament.id,
    );
  }

  @UseGuards(LoggedInGuard)
  @Get(':id/participant/team/participation')
  async fetchParticipationOfParticipantTeam(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const developmentUser = await this.userService.findOne(3);
    const tournament = await this.tournamentService.findOne(+id);
    return await this.participantTeamService.fetchParticipationOfParticipantTeam(
      developmentUser.id,
      tournament.id,
    );
  }

  @UseGuards(LoggedInGuard)
  @Get(':id/participant/team/:teamId/request')
  async fetchParticipantTeamRequests(
    @Req() req: Request,
    @Param('teamId') teamId: string,
  ) {
    (req.user as User).id = 5;
    return await this.participantTeamService.fetchParticipantTeamRequests(
      (req.user as User).id,
      +teamId,
    );
  }

  @UseGuards(LoggedInGuard)
  @Get(':id/participant/team/:teamId/invitation')
  async fetchParticipantTeamInvitations(
    @Req() req: Request,
    @Param('teamId') teamId: string,
  ) {
    (req.user as User).id = 5;
    return await this.participantTeamService.fetchParticipantTeamInvitations(
      (req.user as User).id,
      +teamId,
    );
  }

  @UseGuards(LoggedInGuard)
  @Post(':id/participant/team/:teamId/invitation')
  async sendInvitationsToUsers(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('teamId') teamId: string,
    @Body('usersId') usersId: number[],
  ) {
    (req.user as User).id = 5;
    return await this.participantTeamService.sendInvitationsToUsers(
      +teamId,
      +id,
      usersId,
    );
  }

  @UseGuards(LoggedInGuard)
  @Put(':id/participant/team/:teamId/request/:requestId')
  async updateRequestStatus(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('requestId') requestId: string,
    @Body('status') status: 'accepted' | 'declined',
  ) {
    return await this.participantTeamService.updateRequestStatus(
      +requestId,
      status,
    );
  }

  @UseGuards(LoggedInGuard)
  @Put(':id/participant/team/:teamId/invitation/:invitationId')
  async updateInvitationStatus(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('invitationId') invitationId: string,
    @Body('status') status: 'accepted' | 'declined',
  ) {
    return await this.participantTeamService.updateInvitationStatus(
      +invitationId,
      status,
    );
  }

  @Post(':id/participant/team')
  @UseInterceptors(DateInterceptor, ParticipantInterceptor)
  async createTeamParticipant(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() addParticipantTeamDto: AddParticipantTeamDto,
  ) {
    const developmentUser = await this.userService.findOne(8);
    const tournament = await this.tournamentService.findOne(+id);
    return await this.participantTeamService.create(
      developmentUser,
      tournament.id,
      addParticipantTeamDto,
    );
  }

  @UseGuards(LoggedInGuard)
  @Post(':id/bracket-phase')
  async passInBracketPhase(@Param('id') id: string, @Req() req: Request) {
    const tournament = await this.tournamentService.findOne(+id);
    const isAdmin = await this.tournamentService.findOneAdminByUserId(
      +id,
      (req.user as User).id,
    );
    if (tournament.ownerId === (req.user as User).id || isAdmin) {
      if (tournament.participants.length < tournament.numbersPlayers)
        throw new BadRequestException(
          `need ${tournament.numbersPlayers} to pass in bracket phase`,
        );
      return await this.tournamentService.createBracketPhase(+id);
    }
    throw new BadRequestException(
      'only admins or owner can pass tournament to bracket phase',
    );
  }

  @Put(':tournamentId')
  @UseGuards(LoggedInGuard)
  // @UseInterceptors(DateInterceptor)
  @CheckTournamentAbility({ action: Action.Update, subject: Tournament })
  async update(
    @Param('tournamentId') id: string,
    @Body()
    updateTournamentDto: UpdateTournamentDto,
  ) {
    const tournament = await this.tournamentService.findOne(+id);
    if (updateTournamentDto.hasQualifier !== undefined) {
      await this.qualifierService.createOrUpdate(
        +id,
        tournament,
        updateTournamentDto.hasQualifier,
      );
    }
    if (updateTournamentDto.numbersPlayers) {
      const roundsToSave = this.matchService.findRoundsToSave(
        updateTournamentDto.numbersPlayers,
      );
      await this.matchService.createOrUpdate(
        tournament,
        updateTournamentDto.numbersPlayers,
      );

      await this.tournamentMappoolService.updateMappoolsNumber(
        +id,
        roundsToSave,
      );
    }
    return await this.tournamentService.update(tournament, updateTournamentDto);
  }
  @UseGuards(LoggedInGuard)
  @Put(':id/public')
  async updatePrivacy(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updatePublication: UpdatePublication,
  ) {
    const tournament = await this.tournamentService.findOne(+id);
    const isAdmin = await this.tournamentService.findOneAdminByUserId(
      tournament.id,
      (req.user as User).id,
    );
    if (tournament.ownerId === (req.user as User).id || isAdmin) {
      return await this.tournamentService.updatePrivacy(
        +id,
        updatePublication.isPublic,
      );
    }
    throw new BadRequestException('only admins or owner can update privacy');
  }

  @Post(':tournamentId/staff')
  @UseGuards(LoggedInGuard)
  async addStaff(
    @Param('tournamentId') id: string,
    @Body() addingStaffDto: AddingStaffDto,
    @Req() req: Request,
  ) {
    const tournament = await this.tournamentService.findOne(+id);
    tournament.type === TournamentType.Solo
      ? await this.participantIndividualService.removeByUserId(
          (req.user as User).id,
          +id,
        )
      : await this.participantTeamService.removeByUserId(
          (req.user as User).id,
          +id,
        );
    if (addingStaffDto.role === 'admin')
      return await this.tournamentService.createAdmin(
        +id,
        addingStaffDto.userId ? addingStaffDto.userId : (req.user as User).id,
        addingStaffDto.userId ? addingStaffDto.validate : false,
      );

    if (addingStaffDto.role === 'mappooler')
      return await this.mappoolerService.create(
        +id,
        addingStaffDto.userId ? addingStaffDto.userId : (req.user as User).id,
        addingStaffDto.userId ? addingStaffDto.validate : false,
      );

    if (addingStaffDto.role === 'referee')
      return await this.refereeService.create(
        +id,
        addingStaffDto.userId ? addingStaffDto.userId : (req.user as User).id,
        addingStaffDto.userId ? addingStaffDto.validate : false,
      );
  }

  @UseGuards(LoggedInGuard)
  @Put(':tournamentId/staff/:staffId')
  async acceptCandidate(
    @Param('tournamentId') id: string,
    @Param('staffId') staffId: string,
    @Body('role') role: 'admin' | 'mappooler' | 'referee',
  ) {
    const staff =
      (await this.tournamentService.findOneAdmin(+id, +staffId)) ??
      (await this.mappoolerService.findOne(+id, +staffId)) ??
      (await this.refereeService.findOne(+id, +staffId));

    const tournament = await this.tournamentService.findOne(+id);
    tournament.type === TournamentType.Solo
      ? await this.participantIndividualService.removeByUserId(
          staff.userId,
          +id,
        )
      : await this.participantTeamService.removeByUserId(staff.userId, +id);

    role === 'admin'
      ? await this.tournamentService.validateAdmin(+id, +staffId)
      : role === 'mappooler'
      ? await this.mappoolerService.validateMappooler(+id, +staffId)
      : await this.refereeService.validateReferee(+id, +staffId);

    return {
      subject: role.charAt(0).toUpperCase() + role.slice(1),
      message: `new ${role} added`,
    };
  }

  @UseGuards(LoggedInGuard)
  @Delete(':tournamentId/staff/:staffId')
  async removeStaff(
    @Param('tournamentId') id: string,
    @Param('staffId') staffId: string,
    @Body('role') role: 'admin' | 'mappooler' | 'referee',
  ) {
    role === 'admin'
      ? await this.tournamentService.removeAdmin(+id, +staffId)
      : role === 'mappooler'
      ? await this.mappoolerService.removeMappooler(+id, +staffId)
      : await this.refereeService.removeReferee(+id, +staffId);

    return {
      subject: role.charAt(0).toUpperCase() + role.slice(1),
      message: `${role} removed`,
    };
  }

  @Get(':tournamentId/participant')
  async findParticipant(@Param('tournamentId') id: string) {
    const tournament = await this.tournamentService.findOne(+id);
    return tournament.type === TournamentType.Solo
      ? await this.participantIndividualService.findAll(+id)
      : await this.participantTeamService.findAll(+id, tournament);
  }

  @UseGuards(LoggedInGuard)
  @Put(':tournamentId/participant/:participantId')
  async removeParticipant(
    @Param('tournamentId') id: string,
    @Param('participantId') participantId: string,
    @Body('validate') validate: boolean,
  ) {
    const tournament = await this.tournamentService.findOne(+id);
    return tournament.type === TournamentType.Solo
      ? await this.participantIndividualService.udpateValidation(
          +participantId,
          +id,
          validate,
        )
      : await this.participantTeamService.udpateValidation(
          +participantId,
          +id,
          validate,
        );
  }

  @UseGuards(LoggedInGuard)
  @Get(':tournamentId/team')
  async findTeams(@Param('tournamentId') id: string) {
    const tournament = await this.tournamentService.findOne(+id);
    return await this.participantTeamService.findAll(+id, tournament);
  }
}
