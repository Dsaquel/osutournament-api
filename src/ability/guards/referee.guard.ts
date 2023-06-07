import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AbilityFactory, RefereeAbility } from '../ability.factory';
import { Reflector } from '@nestjs/core';
import { CHECK_ABILITY, RequiredRuleReferee } from '../ability.decorator';
import { ForbiddenError } from '@casl/ability';

@Injectable()
export class RefereeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<RequiredRuleReferee[]>(
        CHECK_ABILITY,
        context.getHandler(),
      ) || [];
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = request.params.id;
    let ability: RefereeAbility;
    if (id) ability = await this.abilityFactory.refereeMatchAbility(+id, user);
    ability = await this.abilityFactory.refereeGlobalAbility(user)
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
