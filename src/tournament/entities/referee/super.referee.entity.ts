import { Node } from 'src/pagination/entities/node.entity';
import { Referee } from './referee.entity';
import { Admin } from '../admin/admin.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Lobby } from 'src/qualifier/entities/lobby/lobby.entity';
import { Match } from 'src/match/entities/match/match.entity';
import { Reschedule } from 'src/match/entities/match/reschedule.entity';

@Entity()
export class SuperReferee extends Node {
  @Column()
  type: 'admin' | 'referee' | 'owner';

  @OneToOne(() => Admin, (admin) => admin.superReferee, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  admin: Admin;

  @OneToOne(() => Referee, (referee) => referee.superReferee, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  referee: Referee;

  @Column({ nullable: true })
  adminId: number;

  @Column({ nullable: true })
  refereeId: number;

  @Column({ nullable: true })
  ownerId: number;

  @OneToMany(() => Lobby, (lobby) => lobby.superReferee)
  lobbies: Lobby[];

  @OneToMany('Match', 'superReferee')
  matches: Match[];

  @OneToMany(() => Reschedule, (reschedule) => reschedule.superReferee)
  reschedules: Reschedule[];
}
