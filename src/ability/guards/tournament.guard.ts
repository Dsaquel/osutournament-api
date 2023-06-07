import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AbilityFactory } from '../ability.factory';
import { Reflector } from '@nestjs/core';
import {
  CHECK_ABILITY,
  RequiredRuleTournament,
  RequiredRuleUser,
} from '../ability.decorator';
import { ForbiddenError } from '@casl/ability';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class TournamentGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<RequiredRuleTournament[]>(
        CHECK_ABILITY,
        context.getHandler(),
      ) || [];
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;
    const tournamentId = request.params.tournamentId;
    const ability = await this.abilityFactory.tournamentAbility(
      +tournamentId,
      user as User,
    );
    try {
      rules.forEach((rule) =>
        ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
    }
  }
}
