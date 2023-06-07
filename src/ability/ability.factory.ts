import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Tournament } from '../tournament/entities/tournament/tournament.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Referee } from 'src/tournament/entities/referee/referee.entity';
import { Mappooler } from 'src/tournament/entities/mappool/mappooler.entity';
import { Match } from 'src/match/entities/match/match.entity';
import { Draft } from 'src/tournament/entities/draft/draft.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  PrivateRead = 'privateRead',
  Update = 'update',
  Delete = 'delete',
}

export type OwnerSubjects =
  | InferSubjects<typeof Tournament | typeof Referee | typeof Mappooler>
  | 'all';
export type TournamentSubjects = InferSubjects<typeof Tournament>;
export type RefereeSubjects = InferSubjects<typeof Referee>;
export type UserSubjects = InferSubjects<typeof Draft> | 'all';

export type TournamentAbility = Ability<[Action, TournamentSubjects]>;
export type RefereeAbility = Ability<[Action, RefereeSubjects]>;
export type AppAbility = Ability<[Action, OwnerSubjects]>;
export type UserAbility = Ability<[Action, UserSubjects]>;

@Injectable()
export class AbilityFactory {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
    @InjectRepository(Draft)
    private readonly drafts: Repository<Draft>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(Referee)
    private readonly referees: Repository<Referee>,
    @InjectRepository(Mappooler)
    private readonly mappoolers: Repository<Mappooler>,
  ) {}

  async tournamentAbility(id: number, user: User) {
    const tournament = await this.tournaments.findOne({
      where: { id },
    });
    const checking =
      (await this.referees.findOne({
        where: { userId: user.id, validate: true },
      })) ??
      (await this.mappoolers.findOne({
        where: { userId: user.id, validate: true },
      }));
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<TournamentAbility>,
    );

    if (!tournament.isPublic && (checking || tournament.ownerId === user.id)) {
      can(Action.Manage, Tournament);
    } else if (
      tournament.isPublic &&
      (!checking || tournament.ownerId !== user.id)
    ) {
      can(Action.Read, Tournament);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<TournamentSubjects>,
    });
  }

  async draftAbility(id: number, user: User) {
    const draft = await this.drafts.findOne({
      where: { id },
    });
    const checking =
      (await this.referees.findOne({
        where: { userId: user.id, validate: true },
      })) ??
      (await this.mappoolers.findOne({
        where: { userId: user.id, validate: true },
      }));
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<UserAbility>,
    );

    if (!draft.isPublic && (checking || draft.ownerId === user.id)) {
      can(Action.Manage, Draft);
    } else if (draft.isPublic && (!checking || draft.ownerId !== user.id)) {
      can(Action.Read, Draft);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<UserSubjects>,
    });
  }

  async ownerAbility(id: number, user: User) {
    const tournament = await this.tournaments.findOneOrFail({ where: { id } });
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (tournament.ownerId === user.id) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<OwnerSubjects>,
    });
  }

  async refereeGlobalAbility(user: User): Promise<RefereeAbility> {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<RefereeAbility>,
    );
    const isReferee =
      (await this.referees.findOne({ where: { id: user.id } })).validate ===
      true;
    console.log(isReferee);
    if (isReferee) {
      console.log('king');
      can(Action.Manage, Referee);
    } else {
      console.log('slave');
      can(Action.Read, Referee);
      console.log('slave');
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<RefereeSubjects>,
    });
  }

  async refereeMatchAbility(id: number, user: User) {
    const match = await this.matches.findOne({ where: { id } });
    const referee = await this.referees.findOne({
      where: {
        tournamentId: match.tournamentId,
        validate: true,
      },
    });
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<RefereeAbility>,
    );

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<RefereeSubjects>,
    });
  }

  userAbility(id: number, user: User) {
    const { can, cannot, build } = new AbilityBuilder(
      Ability as AbilityClass<UserAbility>,
    );

    if (id === user.id) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, 'all');
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<UserSubjects>,
    });
  }
}
