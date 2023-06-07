import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { QualifierParticipant } from '../participant/participant.qualifier.entity';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import { Lobby } from '../lobby/lobby.entity';
import { ParticipantMapScore } from '../participant/participant.map.score.entity';
import { QualifierMappool } from 'src/common/entities/mappool.entity';

@Entity()
export class Qualifier extends Node {
  @OneToOne(
    () => QualifierMappool,
    (qualifierMappool) => qualifierMappool.qualifier,
    { onDelete: 'CASCADE', eager: true },
  )
  mappool: QualifierMappool;

  @OneToMany(() => Mappooler, (mappooler) => mappooler.tournament, {
    onDelete: 'CASCADE',
  })
  mappoolers: Mappooler[];

  @OneToMany(
    () => QualifierParticipant,
    (qualifierParticipant) => qualifierParticipant.qualifier,
    { onDelete: 'CASCADE' },
  )
  participants: QualifierParticipant[];

  @OneToOne(() => Tournament, (tournament) => tournament.qualifier)
  @JoinColumn()
  tournament: Tournament;

  @OneToMany(() => Lobby, (lobby) => lobby.qualifier, { onDelete: 'CASCADE' })
  lobbies: Lobby[];

  @OneToMany(
    () => ParticipantMapScore,
    (participantMapScore) => participantMapScore.qualifier,
  )
  participantsScore: ParticipantMapScore[];

  @Column()
  tournamentId: number;
}
