import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { User } from 'src/user/entities/user.entity';
import { Tournament } from '../tournament/tournament.entity';
import { Match } from 'src/match/entities/match/match.entity';
import { Lobby } from 'src/qualifier/entities/lobby/lobby.entity';
import { SuperReferee } from './super.referee.entity';

@Entity()
export class Referee extends Node {
  @Column({ default: false })
  validate: boolean;

  @Column()
  userId: number;

  @Column()
  tournamentId: number;

  @ManyToOne(() => User, (user) => user.referees, {
    eager: true,
  })
  user: User;

  @ManyToOne(() => Tournament, (tournament) => tournament.referees)
  tournament: Tournament;

  @OneToOne(() => SuperReferee, (superReferee) => superReferee.referee)
  superReferee: SuperReferee;
}
