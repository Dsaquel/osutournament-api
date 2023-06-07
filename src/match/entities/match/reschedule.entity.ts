import { Node } from 'src/pagination/entities/node.entity';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Player } from '../player/player.entity';
import { Match } from './match.entity';

@Entity()
export class Reschedule extends Node {
  @Column({ nullable: true })
  schedule: string;

  @Column({ default: 'request' })
  status: 'request' | 'accepted' | 'refused';

  @Column()
  shortMessage: string;

  @ManyToOne(() => Match, (match) => match.reschedules)
  match: Match;

  @ManyToOne(() => Player, (player) => player.reschedules)
  @JoinColumn([{ name: 'player1Id' }, { name: 'player2Id' }])
  player: Player;

  @Column()
  matchId: number;

  @Column({ nullable: true })
  playerId: number;

  @ManyToOne(() => SuperReferee, (superReferee) => superReferee.reschedules)
  superReferee: SuperReferee;

  @Column({ nullable: true })
  superRefereeId: number;
}
