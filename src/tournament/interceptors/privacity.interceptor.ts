import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TournamentService } from '../services/tournament.service';

@Injectable()
export class PrivacityInterceptor implements NestInterceptor {
  constructor(private readonly tournaments: TournamentService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const body: { isPublic: boolean } = context.switchToHttp().getRequest()
      .body.date; // because date
    const id = request.params.id;
    if (body.isPublic !== undefined) {
      const tournament = await this.tournaments.findOne(+id);
      if (tournament.isPublicable) {
        return next.handle();
      } else {
        throw new HttpException(
          'tournament is not publicable, please check rules make the tournament publicable',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException('isPublic is undefined', HttpStatus.BAD_REQUEST);
    }
  }
}
