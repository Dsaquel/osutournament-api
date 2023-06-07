import { Validate } from 'class-validator';
import { minDate } from 'src/tournament/validators/date.validator';

export class UpdateMappoolDto {
  @Validate(minDate)
  readonly displayMappoolsSchedule?: string;
}
