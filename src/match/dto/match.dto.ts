import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { minDate } from '../../tournament/validators/date.validator';

const state = ['playing', 'pending', 'complete'] as const;
type StateMatch = typeof state[number];

export class UpdateMatchDto {
  @IsOptional()
  @IsNumber()
  readonly firstTo?: number;

  @IsOptional()
  @IsIn(state)
  readonly state?: StateMatch;

  @IsOptional()
  @IsDateString()
  @Validate(minDate)
  readonly startDate?: string;

  @IsOptional()
  @IsString()
  readonly rulesLobby?: string;

  @IsOptional()
  @IsString()
  readonly matchesHistoryOsu?: string;

  @IsOptional()
  @IsNumber()
  readonly player1Score?: number;

  @IsOptional()
  @IsNumber()
  readonly player2Score?: number;
}
