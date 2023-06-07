import { Module, forwardRef } from '@nestjs/common';
import { TournamentService } from './services/tournament.service';
import { TournamentController } from './controllers/tournament.controller';
import { Tournament } from './entities/tournament/tournament.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TournamentStartProcessor } from './jobs/start.tournament.processor';
import { TournamentRegistrationEndProcessor } from './jobs/registration.end.processor';
import { Referee } from './entities/referee/referee.entity';
import { Mappooler } from './entities/mappool/mappooler.entity';
import { AbilityModule } from '../ability/ability.module';
import { MappoolerController } from './controllers/mappooler.controller';
import { MappoolerService } from './services/mappooler.service';
import { RefereeController } from './controllers/referee.controller';
import { RefereeService } from './services/referee.service';
import { DateInterceptor } from './interceptors/date.interceptor';
import { TournamentSubscriber } from './entities/tournament/tournament.subscriber';
import { TournamentStartDateJob } from './jobs/start.tournament.job';
import { TournamentEndRegistrationJob } from './jobs/registration.end.job';
import { DraftSubscriber } from './entities/draft/draft.subscriber';
import { minDate } from './validators/date.validator';
import { MatchModule } from 'src/match/match.module';
import { QualifierModule } from 'src/qualifier/qualifier.module';
import {
  Participant,
  ParticipantIndividual,
  ParticipantTeam,
} from './entities/participant/participant.entity';
import { TournamentInterceptor } from './interceptors/tournament.interceptor';
import { PrivacityInterceptor } from './interceptors/privacity.interceptor';
import { DraftController } from './controllers/draft.controller';
import { DraftService } from './services/draft.service';
import { Draft } from './entities/draft/draft.entity';
import { Mappool, TournamentMappool } from 'src/common/entities/mappool.entity';
import { TournamentMappoolService } from './services/mappool.tournament.service';
import { TournamentMappoolController } from './controllers/mappool.controller';
import { TournamentMapService } from './services/map.tournament.service';
import { TournamentMap } from './entities/map/map.tournament.entity';
import { OsuService } from 'src/osu/osu.service';
import { UserService } from 'src/user/user.service';
import { CommonService } from 'src/common/services/common.service';
import { User } from 'src/user/entities/user.entity';
import { Credential } from 'src/common/entities/credential.entity';
import { Admin } from './entities/admin/admin.entity';
import { QualifierParticipantService } from 'src/qualifier/services/participant.qualifier.service';
import { QualifierParticipant } from 'src/qualifier/entities/participant/participant.qualifier.entity';
import { SuperReferee } from './entities/referee/super.referee.entity';
import { ParticipantIndividualService } from './services/individual.participant.service';
import { ParticipantTeamService } from './services/team.participant.service';
import { ParticipantInterceptor } from './interceptors/participant.interceptor';
import {
  InvitationTeam,
  ParticipantInvitation,
  ParticipantRequest,
} from './entities/participant/invitation.team.entity';
import { Match } from 'src/match/entities/match/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tournament,
      TournamentMappool,
      Match,
      Referee,
      Mappooler,
      Participant,
      Draft,
      Mappool,
      TournamentMap,
      User,
      Credential,
      Admin,
      QualifierParticipant,
      SuperReferee,
      ParticipantIndividual,
      ParticipantTeam,
      ParticipantInvitation,
      ParticipantRequest,
      InvitationTeam,
    ]),
    BullModule.registerQueue(
      {
        name: 'startTournament',
      },
      {
        name: 'registrationEndDate',
      },
    ),
    AbilityModule,
    MatchModule,
    QualifierModule,
  ],
  controllers: [
    DraftController,
    TournamentController,
    MappoolerController,
    RefereeController,
    TournamentMappoolController,
  ],
  providers: [
    TournamentService,
    TournamentStartProcessor,
    TournamentRegistrationEndProcessor,
    MappoolerService,
    RefereeService,
    TournamentMappoolService,
    DateInterceptor,
    TournamentStartDateJob,
    TournamentEndRegistrationJob,
    TournamentSubscriber,
    DraftSubscriber,
    minDate,
    TournamentInterceptor,
    PrivacityInterceptor,
    ParticipantInterceptor,
    DraftService,
    TournamentMapService,
    OsuService,
    UserService,
    CommonService,
    QualifierParticipantService,
    ParticipantIndividualService,
    ParticipantTeamService,
    UserService,
  ],
  exports: [TournamentService],
})
export class TournamentModule {}
