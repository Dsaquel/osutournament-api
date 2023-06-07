import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { TournamentType } from 'src/common/helper/enum.helper';

export class DraftDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly details?: string;

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
  readonly estimateStartDate?: string;

  @IsOptional()
  @IsString()
  readonly mode?: 'standard';

  @IsNotEmpty()
  @IsEnum(TournamentType)
  readonly type: TournamentType;

  @ValidateIf((obj: DraftDto) => obj.type === TournamentType.Team)
  @IsNotEmpty()
  @IsNumber()
  readonly teamNumberMax?: number;

  @ValidateIf((obj: DraftDto) => obj.type === TournamentType.Team)
  @IsNotEmpty()
  @IsNumber()
  readonly teamNumberMin?: number;
}

export class UpdateDraftDto extends DraftDto {
  @IsOptional()
  @IsString()
  readonly name: string;
}

export class UpdatePublication {
  @IsNotEmpty()
  @IsBoolean()
  readonly isPublic: boolean;
}
