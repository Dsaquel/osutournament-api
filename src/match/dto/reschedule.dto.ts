import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const status = ['request', 'accepted', 'refused'] as const;
type StatusReschedule = typeof status[number];

export class CreateRescheduleDto {
  @IsOptional()
  @IsDateString()
  schedule?: string;

  @IsNotEmpty()
  @IsIn(status)
  status: StatusReschedule;

  @IsOptional()
  @IsString()
  shortMessage?: string;
}
