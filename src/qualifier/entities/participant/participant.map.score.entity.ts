import { Column, Entity, ManyToOne } from 'typeorm';
import { QualifierMap } from '../map/map.qualifier.entity';
import { Node } from 'src/pagination/entities/node.entity';
import { Qualifier } from '../qualifier/qualifier.entity';
import { Participant } from 'src/tournament/entities/participant/participant.entity';

@Entity()
export class ParticipantMapScore extends Node {
  @Column({ nullable: true })
  rank: number;

  @Column({ nullable: true })
  score: number;

  @ManyToOne(
    () => QualifierMap,
    (qualifierMap) => qualifierMap.participantsMapPlayed,
  )
  qualifierMapPlayed: QualifierMap;

  @ManyToOne(() => Participant)
  participant: Participant;

  @ManyToOne(() => Qualifier, (qualifier) => qualifier.participantsScore)
  qualifier: Qualifier;

  @Column()
  participantId: number;

  @Column()
  qualifierMapPlayedId: number;

  @Column()
  qualifierId: number;

  @Column({ nullable: true, array: true, type: 'int' })
  participantsHadScoredIds: number[];
}
