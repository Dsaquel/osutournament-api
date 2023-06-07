import { Node } from 'src/pagination/entities/node.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Qualifier } from '../qualifier/qualifier.entity';
import { ParticipantMapScore } from './participant.map.score.entity';

@Entity()
export class QualifierParticipant extends Node {
  @Column({ default: true })
  validate: boolean;

  @Column({ nullable: true })
  seed: number;

  @Column({ nullable: true })
  totalRank: number;

  @Column({ nullable: true })
  totalScore: number;

  @OneToMany(
    () => ParticipantMapScore,
    (participantMapScore) => participantMapScore.qualifierMapPlayed,
  )
  mapsScoreDetails: ParticipantMapScore[];

  @ManyToOne(() => Qualifier, (qualifier) => qualifier.participants)
  qualifier: Qualifier;

  @Column()
  qualifierId: number;
}
