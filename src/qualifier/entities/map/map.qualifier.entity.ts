import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ParticipantMapScore } from '../participant/participant.map.score.entity';
import { Map } from 'src/common/entities/map.entity';
import { QualifierMappool } from 'src/common/entities/mappool.entity';

@Entity()
export class QualifierMap extends Map {
  @OneToMany(
    () => ParticipantMapScore,
    (participantMapScore) => participantMapScore.qualifierMapPlayed,
  )
  participantsMapPlayed: ParticipantMapScore[];

  @ManyToOne(
    () => QualifierMappool,
    (qualifierMappool) => qualifierMappool.maps,
  )
  @JoinColumn()
  mappool: QualifierMappool;

  @Column()
  qualifierId: number;
}
