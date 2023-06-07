import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { Referee } from 'src/tournament/entities/referee/referee.entity';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import {
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';
import { Draft } from 'src/tournament/entities/draft/draft.entity';
import {
  ParticipantInvitation,
  ParticipantRequest,
} from 'src/tournament/entities/participant/invitation.team.entity';

@Entity()
export class User extends Node {
  @Column()
  osuId: number;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  avatarUrl: string;

  @Column()
  rank: number;

  @Column({ type: 'varchar', nullable: true })
  discord?: string;

  @OneToMany(() => Tournament, (target) => target.owner)
  tournamentsCreated: Tournament[];

  @OneToMany(() => Draft, (draft) => draft.owner)
  drafts: Draft[];

  @OneToMany(
    () => ParticipantIndividual,
    (participantIndividual) => participantIndividual.user,
  )
  participantIndividual: ParticipantIndividual[];

  @ManyToMany(
    () => ParticipantTeam,
    (participantTeam) => participantTeam.users,
    { cascade: true },
  )
  @JoinTable()
  participantTeam: ParticipantTeam[];

  @OneToMany(() => Referee, (referee) => referee.user)
  referees: Referee[];

  @OneToMany(() => Mappooler, (mappooler) => mappooler.user)
  mappoolers: Mappooler[];

  @OneToMany(
    () => ParticipantRequest,
    (participantRequest) => participantRequest.userRequest,
  )
  invitationsTeamSent: ParticipantRequest[];

  @OneToMany(
    () => ParticipantInvitation,
    (participantInvitation) => participantInvitation.userInvited,
  )
  invitationsFromTeams: ParticipantInvitation[];
}
