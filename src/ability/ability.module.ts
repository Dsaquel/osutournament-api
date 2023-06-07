import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/match/entities/match/match.entity';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import { Referee } from 'src/tournament/entities/referee/referee.entity';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { User } from 'src/user/entities/user.entity';
import { AbilityFactory } from './ability.factory';
import { Draft } from 'src/tournament/entities/draft/draft.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, Match, Referee, User, Mappooler, Draft])],
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class AbilityModule {}
