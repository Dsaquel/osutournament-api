import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateIf,
} from 'class-validator';
import { TournamentType } from 'src/common/helper/enum.helper';
import { minDate } from '../validators/date.validator';

export class CreateTournamentDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsDateString()
  @Validate(minDate)
  readonly startDate?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  readonly rangePlayerMax?: number;

  @IsOptional()
  @IsNumber()
  readonly rangePlayerMin?: number;

  @IsOptional()
  @IsNumber()
  readonly numbersPlayers?: number;

  @IsOptional()
  @IsDateString()
  @Validate(minDate)
  readonly estimateStartDate?: string;

  @IsOptional()
  @IsBoolean()
  readonly hasQualifier?: boolean | null;

  @IsOptional()
  @IsBoolean()
  readonly isPublic?: boolean;

  @IsNotEmpty()
  @IsEnum(TournamentType)
  readonly type: TournamentType;

  @IsOptional()
  @IsString()
  readonly mode?: 'standard';

  @IsOptional()
  @IsString()
  readonly registrationEndDate?: string;

  @ValidateIf((obj: CreateTournamentDto) => obj.type === TournamentType.Team)
  @IsNotEmpty()
  @IsNumber()
  readonly teamNumberMax?: number;

  @ValidateIf((obj: CreateTournamentDto) => obj.type === TournamentType.Team)
  @IsNotEmpty()
  @IsNumber()
  readonly teamNumberMin?: number;
}
