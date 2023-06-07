import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { User } from 'src/user/entities/user.entity';
import { Tournament } from '../tournament/tournament.entity';
import { SuperReferee } from '../referee/super.referee.entity';

@Entity()
export class Admin extends Node {
  @Column({ default: false })
  validate: boolean;

  @ManyToOne(() => User, (user) => user.referees, {
    eager: true,
  })
  user: User;

  @ManyToOne(() => Tournament, (tournament) => tournament.referees)
  tournament: Tournament;

  @OneToOne(() => SuperReferee, (superReferee) => superReferee.admin, {
    nullable: true,
  })
  superReferee: SuperReferee;

  @Column()
  userId: number;

  @Column()
  tournamentId: number;
}
