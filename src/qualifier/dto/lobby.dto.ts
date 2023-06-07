import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  Validate,
} from 'class-validator';
import { minDate } from 'src/tournament/validators/date.validator';

const status = ['pending', 'started', 'finished'] as const;
type StatusLobby = typeof status[number];

export class CreateLobbyDto {
  @IsNotEmpty()
  @IsDateString()
  @Validate(minDate)
  readonly schedule: string;
}

export class UpdateLobbyDto {
  @IsOptional()
  @IsDateString()
  @Validate(minDate)
  readonly schedule?: string;

  @IsOptional()
  @IsIn(status)
  readonly status?: StatusLobby;
}
