import { Node } from 'src/pagination/entities/node.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, TableInheritance } from 'typeorm';
import { Tournament } from '../tournament/tournament.entity';
import { ParticipantTeam } from './participant.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class InvitationTeam extends Node {
  @ManyToOne(
    () => ParticipantTeam,
    (participantTeam) => participantTeam.invitations,
  )
  participantTeam: ParticipantTeam;

  @Column()
  participantTeamId: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.invitationsTeam)
  tournament: Tournament;

  @Column()
  tournamentId: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'declined';
}

@Entity()
export class ParticipantRequest extends InvitationTeam {
  @ManyToOne(() => User, (user) => user.invitationsTeamSent)
  userRequest: User;

  @Column()
  userRequestId: number;
}

@Entity()
export class ParticipantInvitation extends InvitationTeam {
  @ManyToOne(() => User, (user) => user.invitationsFromTeams)
  userInvited: User;

  @Column()
  userInvitedId: number;
}
