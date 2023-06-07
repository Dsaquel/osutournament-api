import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'minDate', async: true })
@Injectable()
export class minDate implements ValidatorConstraintInterface {
  constructor() {}
  async validate(
    value: any,
    validationArguments?: ValidationArguments | undefined,
  ): Promise<boolean> {
    if (+new Date(value) - Date.now() < 0) return false;
    return true;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'You cannot';
  }
}
