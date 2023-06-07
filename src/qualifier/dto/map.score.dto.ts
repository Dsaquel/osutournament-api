import { IsNotEmpty, IsNumber } from 'class-validator';

export class MapScoreDto {
  @IsNotEmpty()
  @IsNumber()
  matchId: number;
}
