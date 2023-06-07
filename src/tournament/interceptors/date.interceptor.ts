import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Tournament } from '../entities/tournament/tournament.entity';

@Injectable()
export class DateInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    console.log('date interceptor');
    const tournament = await this.tournaments.findOneOrFail({
      where: { id },
      relations: {
        referees: true,
        mappools: true,
        mappoolers: true,
        owner: true,
        matches: true,
        players: true,
      },
    });
    if (!tournament)
      throw new HttpException('no tournament to edit', HttpStatus.BAD_REQUEST);

    //NOTE: necessay ?
    if (!tournament.startDate)
      throw new HttpException('need a start date', HttpStatus.BAD_REQUEST);

    const startDate = Date.parse(tournament.startDate as string) - Date.now();
    if (startDate < 0)
      throw new HttpException(
        'cannot participate in a tournament when he is already started',
        HttpStatus.BAD_REQUEST,
      );

    const registrationEnd =
      Date.parse(tournament.registrationEndDate as string) - Date.now();
    if (registrationEnd < 0)
      throw new HttpException(
        'cannot participate when registration is ended',
        HttpStatus.BAD_REQUEST,
      );

    return next.handle();
  }
}
