import { Match } from 'src/match/entities/match/match.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Node } from 'src/pagination/entities/node.entity';
import { User } from 'src/user/entities/user.entity';
import { Referee } from '../referee/referee.entity';
import { Mappooler } from '../mappool/mappooler.entity';
import { Player } from 'src/match/entities/player/player.entity';
import { Qualifier } from 'src/qualifier/entities/qualifier/qualifier.entity';
import { Participant } from '../participant/participant.entity';
import { Draft } from '../draft/draft.entity';
import { TournamentType } from 'src/common/helper/enum.helper';
import { InvitationTeam } from '../participant/invitation.team.entity';
import { TournamentMappool } from 'src/common/entities/mappool.entity';

@Entity()
export class Tournament extends Node {
  @Column({ default: false })
  isPublicable: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isFinished: boolean;

  @Column({ default: false })
  isInBracketPhase: boolean;

  @Column({ default: false })
  hasQualifier: boolean;

  @Column()
  name: string;

  @Column({ nullable: true })
  startDate: string;

  @Column({ default: 'standard' })
  mode: 'standard';

  @Column({ default: TournamentType.Solo })
  type: TournamentType;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 2 })
  teamNumberMax: number;

  @Column({ default: 2 })
  teamNumberMin: number;

  @Column({ nullable: true })
  rangePlayerMax: number;

  @Column({ default: 1 })
  rangePlayerMin: number;

  @Column({ nullable: true })
  numbersPlayers: number;

  @Column({ nullable: true })
  registrationEndDate: string;

  @Column({ default: false })
  registrationEnd: boolean;

  @OneToOne(() => Draft, (draft) => draft.tournament)
  @JoinColumn()
  draft: Draft;

  @Column()
  draftId: number;

  @OneToOne(() => Qualifier, (qualifier) => qualifier.tournament, {
    eager: true,
  })
  qualifier: Qualifier;

  @OneToMany(() => Referee, (referee) => referee.tournament)
  referees: Referee[];

  @OneToMany(() => Mappooler, (mappooler) => mappooler.tournament)
  mappoolers: Mappooler[];

  @OneToMany(() => TournamentMappool, (mappool) => mappool.tournament, {
    eager: true,
  })
  @JoinColumn()
  mappools: TournamentMappool[];

  @OneToMany(() => Participant, (participant) => participant.tournament)
  participants: Participant[];

  @OneToMany(
    () => InvitationTeam,
    (invitationTeam) => invitationTeam.tournament,
  )
  invitationsTeam: InvitationTeam[];

  @ManyToOne(() => User, (user) => user.tournamentsCreated, { eager: true })
  owner: User;

  @Column()
  ownerId: number;

  @OneToMany(() => Match, (match) => match.tournament)
  matches: Match[];

  @OneToMany(() => Player, (player) => player.tournament)
  players: Player[];

  @Column({ nullable: true })
  winnerId: number;
}
