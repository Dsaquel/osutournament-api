import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { User } from 'src/user/entities/user.entity';
import { Tournament } from '../tournament/tournament.entity';
import { TournamentType } from 'src/common/helper/enum.helper';

@Entity()
export class Draft extends Node {
  @Column()
  name: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isPublicable: boolean;

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  rangePlayerMax: number;

  @Column({ default: 1 })
  rangePlayerMin: number;

  @Column({ nullable: true })
  numbersPlayers: number;

  @Column({ nullable: true })
  estimateStartDate: string;

  @Column({ default: 2 })
  teamNumberMax: number;

  @Column({ default: 2 })
  teamNumberMin: number;

  @Column({ default: TournamentType.Solo })
  type: TournamentType;

  @Column({ default: 'standard' })
  mode: 'standard';

  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.tournamentsCreated)
  owner: User;

  @OneToOne(() => Tournament, (tournament) => tournament.draft, { eager: true })
  tournament: Tournament;
}
