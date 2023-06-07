import { Module } from '@nestjs/common';
import { MatchService } from './services/match.service';
import { PlayerService } from './services/player.service';
import { MatchController } from './match.controller';
import { Match } from './entities/match/match.entity';
import { Reschedule } from './entities/match/reschedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { User } from 'src/user/entities/user.entity';
import { AbilityModule } from 'src/ability/ability.module';
import { RefereeInterceptor } from './interceptors/referee.interceptor';
import { Referee } from 'src/tournament/entities/referee/referee.entity';
import { Player } from './entities/player/player.entity';
import { LobbyService } from 'src/qualifier/services/lobby.service';
import { Lobby } from 'src/qualifier/entities/lobby/lobby.entity';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import { QualifierService } from 'src/qualifier/services/qualifier.service';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { RefereeService } from 'src/tournament/services/referee.service';
import { QualifierParticipantService } from 'src/qualifier/services/participant.qualifier.service';
import { Qualifier } from 'src/qualifier/entities/qualifier/qualifier.entity';
import { QualifierMappoolService } from 'src/qualifier/services/mappool.qualifier.service';
import { Admin } from 'src/tournament/entities/admin/admin.entity';
import { MappoolerService } from 'src/tournament/services/mappooler.service';
import { QualifierParticipant } from 'src/qualifier/entities/participant/participant.qualifier.entity';
import {
  Participant,
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import { ParticipantIndividualService } from 'src/tournament/services/individual.participant.service';
import { ParticipantTeamService } from 'src/tournament/services/team.participant.service';
import { UserService } from 'src/user/user.service';
import {
  ParticipantInvitation,
  ParticipantRequest,
} from 'src/tournament/entities/participant/invitation.team.entity';
import { QualifierMappool, TournamentMappool } from 'src/common/entities/mappool.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Match,
      Tournament,
      User,
      TournamentMappool,
      Referee,
      Player,
      Reschedule,
      Lobby,
      SuperReferee,
      Qualifier,
      Admin,
      QualifierParticipant,
      QualifierMappool,
      Mappooler,
      ParticipantIndividual,
      ParticipantTeam,
      ParticipantRequest,
      ParticipantInvitation,
      Participant,
    ]),
    AbilityModule,
  ],
  controllers: [MatchController],
  providers: [
    MatchService,
    RefereeInterceptor,
    PlayerService,
    LobbyService,
    QualifierService,
    TournamentService,
    RefereeService,
    QualifierParticipantService,
    QualifierMappoolService,
    MappoolerService,
    ParticipantIndividualService,
    ParticipantTeamService,
    UserService,
  ],
  exports: [MatchService, PlayerService],
})
export class MatchModule {}
