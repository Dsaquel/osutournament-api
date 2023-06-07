import { Column, Entity, ManyToOne } from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { User } from 'src/user/entities/user.entity';
import { Mappool } from '../../../common/entities/mappool.entity';
import { Tournament } from '../tournament/tournament.entity';

@Entity()
export class Mappooler extends Node {
  @Column({ default: false })
  validate: boolean;

  @Column()
  userId: number;

  @Column()
  tournamentId: number;

  @ManyToOne(() => User, (user) => user.mappoolers, {
    eager: true,
  })
  user: User;

  @ManyToOne(() => Tournament, (tournament) => tournament.mappoolers)
  tournament: Tournament;

  @ManyToOne(() => Mappool, (mappool) => mappool.mappoolers)
  mappool: Mappool;
}
