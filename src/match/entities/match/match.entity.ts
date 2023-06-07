import { Node } from 'src/pagination/entities/node.entity';
import { Participant } from 'src/tournament/entities/participant/participant.entity';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Reschedule } from './reschedule.entity';

@Entity()
export class Match extends Node {
  @ManyToOne(() => Tournament, (tournament) => tournament.matches, {
    nullable: true,
  })
  tournament: Tournament;

  @Column({ nullable: true })
  tournamentId: number;

  @Column({ nullable: true })
  superRefereeId: number;

  @ManyToOne(() => SuperReferee, (superReferee) => superReferee.matches, {
    nullable: true,
  })
  superReferee: SuperReferee;

  @Column({ default: 7 })
  firstTo: number;

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  rulesLobby: string;

  @Column({ nullable: true })
  matchesHistoryOsu: string;

  @Column({ nullable: true })
  player1Id: number;

  @ManyToOne(() => Participant, { nullable: true })
  player1: Participant;

  @Column({ nullable: true })
  player2Id: number;

  @ManyToOne(() => Participant, { nullable: true })
  player2: Participant;

  @Column({ nullable: true })
  winnerId: number;

  @Column({ default: 'pending' })
  state: 'playing' | 'pending' | 'complete';

  @Column({ nullable: true })
  identifier: number;

  @Column({ nullable: true })
  player1PrevIdentifier: number;

  @Column({ nullable: true })
  player2PrevIdentifier: number;

  @Column()
  round: number;

  @Column({ default: 0 })
  player1Score: number;

  @Column({ default: 0 })
  player2Score: number;

  @OneToMany(() => Reschedule, (reschedule) => reschedule.match)
  reschedules: Reschedule[];
}
