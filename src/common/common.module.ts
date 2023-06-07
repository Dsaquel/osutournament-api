import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { Map } from './entities/map.entity';
import { Mappool, QualifierMappool, TournamentMappool } from './entities/mappool.entity';
import { Credential } from './entities/credential.entity';
import { CommonService } from './services/common.service';
import { MappoolScheduleJob } from './jobs/mappool.schedule.job';
import { DisplayMappoolProcessor } from './jobs/display.mappool.processor';
import { BullModule } from '@nestjs/bull';
import { MappoolSubscriber } from './entities/mappool.subscriber';
import { MappoolService } from './services/mappool.service';
import { TournamentMappoolService } from 'src/tournament/services/mappool.tournament.service';
import { MapController } from './controllers/map.controller';
import { TournamentMapService } from 'src/tournament/services/map.tournament.service';
import { TournamentMap } from 'src/tournament/entities/map/map.tournament.entity';
import { QualifierMapService } from 'src/qualifier/services/map.qualifier.service';
import { QualifierMap } from 'src/qualifier/entities/map/map.qualifier.entity';
import { QualifierMappoolService } from 'src/qualifier/services/mappool.qualifier.service';
import { OsuService } from 'src/osu/osu.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { QualifierService } from 'src/qualifier/services/qualifier.service';
import { Qualifier } from 'src/qualifier/entities/qualifier/qualifier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Credential,
      Map,
      Mappool,
      TournamentMappool,
      TournamentMap,
      QualifierMappool,
      QualifierMap,
      User,
      Qualifier,
    ]),
    BullModule.registerQueue({
      name: 'mappoolSchedule',
    }),
  ],
  controllers: [MapController],
  providers: [
    CommonService,
    MappoolScheduleJob,
    DisplayMappoolProcessor,
    MappoolSubscriber,
    MappoolService,
    TournamentMappoolService,
    TournamentMapService,
    QualifierMappoolService,
    QualifierMapService,
    OsuService,
    UserService,
    QualifierService,
  ],
  exports: [CommonService],
})
export class CommonModule {}
