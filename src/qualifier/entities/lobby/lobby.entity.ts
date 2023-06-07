import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { Qualifier } from '../qualifier/qualifier.entity';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Lobby extends Node {
  @Column({ default: 'pending' })
  status: 'pending' | 'started' | 'finished';

  @Column()
  schedule: string;

  @ManyToOne(() => SuperReferee, (superReferee) => superReferee.lobbies, {
    eager: true,
  })
  superReferee: SuperReferee;

  @ManyToOne(() => Qualifier, (qualifier) => qualifier.lobbies)
  qualifier: Qualifier;

  @ManyToMany(() => User, { cascade: true, eager: true })
  @JoinTable()
  participantsLobby: User[];

  @Column()
  superRefereeId: number;

  @Column()
  qualifierId: number;
}
