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
import { QualifierService } from '../services/qualifier.service';
import { UpdateMappoolDto } from '../../common/dto/mappool.dto';

@Injectable()
export class MappoolInterceptor implements NestInterceptor {
  constructor(
    private readonly qualifierMappoolService: QualifierMappoolService,
    private readonly qualifierService: QualifierService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const body: UpdateMappoolDto = request.body;
    const id = request.params.id as string;

    const mappool = await this.qualifierMappoolService.findOne(+id);

    if (!mappool.displayMappoolsSchedule)
      throw new HttpException('impossible to edit', HttpStatus.BAD_REQUEST);
    const time = Date.parse(mappool.displayMappoolsSchedule) - Date.now();
    if (time < 0)
      throw new HttpException(
        'cannot edit mappool when his already started',
        HttpStatus.BAD_REQUEST,
      );

    context.switchToHttp().getRequest().body = { mappool, body };
    return next.handle();
  }
}
