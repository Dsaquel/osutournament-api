import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AbilityFactory } from '../ability.factory';
import { Reflector } from '@nestjs/core';
import { CHECK_ABILITY, RequiredRuleOwner } from '../ability.decorator';
import { ForbiddenError } from '@casl/ability';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules =
      this.reflector.get<RequiredRuleOwner[]>(
        CHECK_ABILITY,
        context.getHandler(),
      ) || [];
    const request = context.switchToHttp().getRequest();
    console.log('owner guard');
    const user = request.user;
    const id = request.params.id;
    const ability = await this.abilityFactory.ownerAbility(+id, user);
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
