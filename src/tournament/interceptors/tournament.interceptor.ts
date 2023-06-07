import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { TournamentService } from '../services/tournament.service';

@Injectable()
export class TournamentInterceptor implements NestInterceptor {
  constructor(private readonly tournamentService: TournamentService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const body: CreateTournamentDto = request.body;
    const qualifier: boolean | null = body.hasQualifier ?? null;

    context.switchToHttp().getRequest().body = { body, qualifier };
    return next.handle();
  }
}
