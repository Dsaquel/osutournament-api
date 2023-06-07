import { IsBoolean, IsIn, IsOptional, IsNumber } from 'class-validator';

const roles = ['mappooler', 'admin', 'referee'] as const;
type Roles = typeof roles[number];

export class AddingStaffDto {
  @IsOptional()
  @IsIn(roles)
  readonly role: Roles;

  @IsOptional()
  @IsBoolean()
  readonly validate?: boolean;

  @IsOptional()
  @IsNumber()
  readonly userId?: number;
}
