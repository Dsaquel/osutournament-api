import { ParticipantType } from 'src/common/helper/enum.helper';
import { Node } from 'src/pagination/entities/node.entity';
import {
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';
import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Match } from '../match/match.entity';
import { Reschedule } from '../match/reschedule.entity';

@Entity()
export class Player extends Node {
  @OneToMany(() => Match, (match) => match.player1 || match.player2, {
    nullable: true,
  })
  matches: Match[];

  @Column({ default: true })
  validate: boolean;

  @ManyToOne(() => Tournament, (tournament) => tournament.players)
  tournament: Tournament;

  @Column()
  tournamentId: number;

  @Column()
  seed: number;

  @OneToMany(() => Reschedule, (reschedule) => reschedule.player)
  reschedules: Reschedule[];
}
