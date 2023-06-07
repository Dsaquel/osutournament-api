import { SetMetadata } from '@nestjs/common';
import {
  Action,
  OwnerSubjects,
  RefereeSubjects,
  UserSubjects,
  TournamentSubjects,
} from './ability.factory';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRuleTournament {
  action: Action;
  subject: TournamentSubjects;
}

export interface RequiredRuleOwner {
  action: Action;
  subject: OwnerSubjects;
}

export interface RequiredRuleReferee {
  action: Action;
  subject: RefereeSubjects;
}

export interface RequiredRuleUser {
  action: Action;
  subject: UserSubjects;
}

export const CheckAbilities = (...requirements: RequiredRuleOwner[]) =>
  SetMetadata(CHECK_ABILITY, requirements);

export const CheckRefereeAbility = (...requirements: RequiredRuleReferee[]) =>
  SetMetadata(CHECK_ABILITY, requirements);

export const CheckUserAbility = (...requirements: RequiredRuleUser[]) =>
  SetMetadata(CHECK_ABILITY, requirements);

export const CheckTournamentAbility = (...requirements: RequiredRuleTournament[]) =>
  SetMetadata(CHECK_ABILITY, requirements);