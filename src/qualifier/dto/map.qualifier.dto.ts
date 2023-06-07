import { Type } from 'class-transformer';
import { Validate, ValidateNested } from 'class-validator';
import { MapType } from 'src/common/helper/types.helper';
import { RequireType } from '../validators/map.type.validator';

export class QualifierMapDto {
  @Validate(RequireType)
  type: MapType;
  beatmapsetId: number;
  beatmapId: number;
  id?: number;
}

export class MapsOutput {
  @ValidateNested()
  @Type(() => QualifierMapDto)
  mapsOutput: QualifierMapDto[];
}
