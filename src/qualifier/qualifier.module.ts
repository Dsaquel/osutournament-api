import { Module } from '@nestjs/common';
import { QualifierService } from './services/qualifier.service';
import { QualifierController } from './controllers/qualifier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qualifier } from './entities/qualifier/qualifier.entity';
import { QualifierParticipant } from './entities/participant/participant.qualifier.entity';
import { QualifierMap } from './entities/map/map.qualifier.entity';
import { QualifierParticipantService } from './services/participant.qualifier.service';
import { QualifierMappoolService } from './services/mappool.qualifier.service';
import { QualifierMapService } from './services/map.qualifier.service';
import { QualifierMapController } from './controllers/map.qualifier.controller';
import { QualifierMappoolController } from './controllers/mappool.qualifier.controller';
import { LobbyController } from './controllers/lobby.controller';
import { LobbyService } from './services/lobby.service';
import { Lobby } from './entities/lobby/lobby.entity';
import { AbilityModule } from 'src/ability/ability.module';
import { ParticipantMapScore } from './entities/participant/participant.map.score.entity';
import { ParticipantMapScoreController } from './controllers/participant.map.score.controller';
import { ParticipantMapScoreService } from './services/participant.map.score.service';
import { OsuModule } from 'src/osu/osu.module';
import { UserModule } from 'src/user/user.module';
import { MapScoreSubscriber } from './entities/participant/map.score.subscriber';
import { MapInterceptor } from './interceptors/map.interceptor';
import { RequireType } from './validators/map.type.validator';
import { MappoolInterceptor } from './interceptors/mappool.interceptor';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { RefereeService } from 'src/tournament/services/referee.service';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { Admin } from 'src/tournament/entities/admin/admin.entity';
import {
  Participant,
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';
import { MappoolerService } from 'src/tournament/services/mappooler.service';
import { Referee } from 'src/tournament/entities/referee/referee.entity';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import { MatchService } from 'src/match/services/match.service';
import { Match } from 'src/match/entities/match/match.entity';
import { Player } from 'src/match/entities/player/player.entity';
import { PlayerService } from 'src/match/services/player.service';
import { Reschedule } from 'src/match/entities/match/reschedule.entity';
import { ParticipantIndividualService } from 'src/tournament/services/individual.participant.service';
import { ParticipantTeamService } from 'src/tournament/services/team.participant.service';
import {
  ParticipantInvitation,
  ParticipantRequest,
} from 'src/tournament/entities/participant/invitation.team.entity';
import { QualifierMappool } from 'src/common/entities/mappool.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Qualifier,
      QualifierParticipant,
      QualifierMappool,
      QualifierMap,
      Lobby,
      ParticipantMapScore,
      SuperReferee,
      Tournament,
      Admin,
      Referee,
      Mappooler,
      Match,
      Player,
      Reschedule,
      ParticipantIndividual,
      ParticipantTeam,
      ParticipantInvitation,
      ParticipantRequest,
      Participant,
    ]),

    AbilityModule,
    OsuModule,
    UserModule,
  ],
  controllers: [
    QualifierController,
    QualifierMapController,
    QualifierMappoolController,
    LobbyController,
    ParticipantMapScoreController,
  ],
  providers: [
    QualifierService,
    QualifierParticipantService,
    QualifierMappoolService,
    QualifierMapService,
    LobbyService,
    ParticipantMapScoreService,
    MapScoreSubscriber,
    MapInterceptor,
    RequireType,
    MappoolInterceptor,
    TournamentService,
    RefereeService,
    MappoolerService,
    MatchService,
    PlayerService,
    ParticipantIndividualService,
    ParticipantTeamService,
  ],
  exports: [QualifierService],
})
export class QualifierModule {}
