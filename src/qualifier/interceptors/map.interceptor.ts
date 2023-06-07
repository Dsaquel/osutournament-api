import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { QualifierMappoolService } from '../services/mappool.qualifier.service';
import { QualifierMapDto } from '../dto/map.qualifier.dto';
import { QualifierMapService } from '../services/map.qualifier.service';
import { QualifierMappool } from 'src/common/entities/mappool.entity';

@Injectable()
export class MapInterceptor implements NestInterceptor {
  constructor(
    private readonly qualifierMappoolService: QualifierMappoolService,
    private readonly qualifierMapService: QualifierMapService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    let mapsBody: QualifierMapDto[] = request.body.maps;
    const id = request.params.id as string;

    const mappool = await this.qualifierMappoolService.findOneSelectTypes(+id);
    const maps = await this.qualifierMapService.findByMappoolId(+id);

    const { mapsOutput, error } = this.checkErrors(
      mapsBody.concat(maps as unknown as QualifierMapDto[]),
      mappool,
    );

    if (error) throw new HttpException('is upper', HttpStatus.BAD_GATEWAY);

    context.switchToHttp().getRequest().body = { mapsOutput };
    return next.handle();
  }

  checkErrors(
    arr: QualifierMapDto[],
    mappool: QualifierMappool,
  ): { mapsOutput: QualifierMapDto[]; error: boolean } {
    let error = false;
    for (const type in mappool) {
      if (arr.some((v) => v.type === type)) {
        if (this.isUpper(arr, mappool[type])) continue;
        error = true;
      }
    }

    const mapsOutput = this.removeCopyObject(arr);

    return { mapsOutput, error };
  }

  removeCopyObject(arr: QualifierMapDto[]): QualifierMapDto[] {
    return arr.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) => t.beatmapId === value.beatmapId && t.type === value.type,
        ),
    );
  }

  // not verified
  isUpper = (array: QualifierMapDto[], c: number): boolean =>
    array.some((v, i, a) => a.length < c + 1);
}

// throw error when rules not appliqued
