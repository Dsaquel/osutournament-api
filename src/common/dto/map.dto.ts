import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { MapType } from '../helper/types.helper';

export class CreateMapDto {
  @IsNotEmpty()
  @IsString()
  readonly type: MapType;

  @IsNotEmpty()
  @IsNumber()
  readonly beatmapsetId: number;

  @IsNotEmpty()
  @IsNumber()
  readonly beatmapId: number;

  @Optional()
  readonly tournamentId?: number;

  @Optional()
  readonly qualifierId?: number;

  @Optional()
  readonly numberOfType?: number;
}
