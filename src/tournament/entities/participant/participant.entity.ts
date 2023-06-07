import {
  AfterInsert,
  BeforeUpdate,
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  TableInheritance,
} from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { User } from 'src/user/entities/user.entity';
import { Tournament } from '../tournament/tournament.entity';
import { ParticipantInvitation } from './invitation.team.entity';
import { ParticipantType } from 'src/common/helper/enum.helper';
import { QualifierParticipant } from 'src/qualifier/entities/participant/participant.qualifier.entity';
import { Player } from 'src/match/entities/player/player.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Participant extends Node {
  @Column({ default: false })
  validate: boolean;

  @ManyToOne(() => Tournament, (tournament) => tournament.participants)
  tournament: Tournament;

  @Column()
  tournamentId: number;

  @Column({ type: 'enum', enum: ParticipantType })
  type: ParticipantType;

  @OneToOne(() => QualifierParticipant, { eager: true, nullable: true })
  @JoinColumn()
  qualifierParticipant: QualifierParticipant;

  @OneToOne(() => Player, { eager: true, nullable: true })
  @JoinColumn()
  player: Player;
}

@ChildEntity(ParticipantType.Individual)
export class ParticipantIndividual extends Participant {
  @AfterInsert()
  @BeforeUpdate()
  updateValidation() {
    if (this.qualifierParticipant) {
      this.qualifierParticipant.validate = this.validate;
    }
  }
  @Column({ default: true })
  validate: boolean;

  @ManyToOne(() => User, (user) => user.participantIndividual, {
    eager: true,
  })
  user: User;

  @Column()
  userId: number;
}

@ChildEntity(ParticipantType.Team)
export class ParticipantTeam extends Participant {
  @AfterInsert()
  @BeforeUpdate()
  updateValidation() {
    if (this.qualifierParticipant) {
      this.qualifierParticipant.validate = this.validate;
    }
  }
  @Column({ default: false })
  validate: boolean;

  @Column()
  name: string;

  @OneToMany(
    () => ParticipantInvitation,
    (participantInvitation) => participantInvitation.participantTeam,
  )
  invitations: ParticipantInvitation[];

  @ManyToMany(() => User, (user) => user.participantTeam)
  users: User[];

  @OneToOne(() => User, { eager: true, nullable: true })
  @JoinColumn()
  captain: User;

  @Column()
  captainId: number;
}
