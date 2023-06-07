import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  TableInheritance,
} from 'typeorm';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import { Node } from 'src/pagination/entities/node.entity';
import { Qualifier } from 'src/qualifier/entities/qualifier/qualifier.entity';
import { QualifierMap } from 'src/qualifier/entities/map/map.qualifier.entity';
import { TournamentMap } from 'src/tournament/entities/map/map.tournament.entity';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Mappool extends Node {
  @Column({ nullable: true })
  displayMappoolsSchedule: string;

  @Column({ default: false })
  isVisible: boolean;

  @OneToMany(() => Mappooler, (mappooler) => mappooler.mappool)
  mappoolers: Mappooler[];
}

export interface IMappool {
  displayMappoolsSchedule: string;
  isVisible: boolean;
  mappoolers: Mappooler[];
}

@ChildEntity()
export class QualifierMappool extends Mappool {
  @OneToMany(() => QualifierMap, (qualifierMap) => qualifierMap.mappool, {
    cascade: true,
    eager: true,
  })
  maps: QualifierMap[];

  @OneToOne(() => Qualifier, (qualifier) => qualifier.mappool, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  qualifier: Qualifier;

  @Column()
  qualifierId: number;
}

@ChildEntity()
export class TournamentMappool extends Mappool {
  @OneToMany(() => TournamentMap, (tournamentMap) => tournamentMap.mappool, {
    eager: true,
    onDelete: 'CASCADE',
  })
  maps: TournamentMap[];

  @Column()
  round: number;

  @Column()
  tournamentId: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.mappools)
  tournament: Tournament;
}
