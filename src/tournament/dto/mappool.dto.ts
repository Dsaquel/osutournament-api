import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  Validate,
} from 'class-validator';
import { minDate } from '../validators/date.validator';

export class CreateMappoolDto {
  @IsOptional()
  @IsDateString()
  @Validate(minDate)
  readonly displayMappoolsSchedule?: string;

  @ArrayNotEmpty()
  @IsArray()
  readonly rounds: number[];

  @IsOptional()
  @IsBoolean()
  readonly isVisible?: boolean;
}

export class UpdateMappoolDto implements Omit<CreateMappoolDto, 'rounds'> {}
