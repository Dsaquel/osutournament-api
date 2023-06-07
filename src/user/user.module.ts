import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Draft } from 'src/tournament/entities/draft/draft.entity';
import { DraftService } from 'src/tournament/services/draft.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { Admin } from 'src/tournament/entities/admin/admin.entity';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import { MappoolerService } from 'src/tournament/services/mappooler.service';
import { RefereeService } from 'src/tournament/services/referee.service';
import { MatchService } from 'src/match/services/match.service';
import { ParticipantIndividualService } from 'src/tournament/services/individual.participant.service';
import { Referee } from 'src/tournament/entities/referee/referee.entity';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import { Match } from 'src/match/entities/match/match.entity';
import { Reschedule } from 'src/match/entities/match/reschedule.entity';
import { PlayerService } from 'src/match/services/player.service';
import {
  Participant,
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';
import { Player } from 'src/match/entities/player/player.entity';
import { ParticipantTeamService } from 'src/tournament/services/team.participant.service';
import {
  ParticipantInvitation,
  ParticipantRequest,
} from 'src/tournament/entities/participant/invitation.team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Draft,
      Tournament,
      Admin,
      Mappooler,
      Referee,
      SuperReferee,
      Match,
      Reschedule,
      ParticipantIndividual,
      Player,
      Participant,
      ParticipantTeam,
      ParticipantRequest,
      ParticipantInvitation,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    DraftService,
    TournamentService,
    MappoolerService,
    RefereeService,
    MatchService,
    ParticipantIndividualService,
    PlayerService,
    ParticipantTeamService,
  ],
  exports: [UserService],
})
export class UserModule {}
