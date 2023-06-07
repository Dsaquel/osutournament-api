import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'RequireType', async: false })
@Injectable()
export class RequireType implements ValidatorConstraintInterface {
  constructor() {}
  async validate(
    value: string,
    validationArguments?: ValidationArguments | undefined,
  ): Promise<boolean> {
    return this.isMapType(value);
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'pas le bon type';
  }
  isMapType(map: string): boolean {
    let res = false;
    if (
      map === 'no_mod' ||
      map === 'hidden' ||
      map === 'hard_rock' ||
      map === 'double_time' ||
      map === 'free_mod' ||
      map === 'tie_breaker'
    ) {
      res = true;
    }

    return res;
  }
}
