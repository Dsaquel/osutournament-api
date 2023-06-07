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
import { Match } from '../entities/match/match.entity';
import { Referee } from '../../tournament/entities/referee/referee.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RefereeInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(Referee)
    private readonly referees: Repository<Referee>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    const user: User = request.user;

    const referee = await this.referees.findOne({
      where: {
        id: user.id,
      },
    });
    if (!referee.validate)
      throw new HttpException('no referee validate', HttpStatus.BAD_REQUEST);

    const match = await this.matches.findOneOrFail({
      where: { id },
      relations: {
        tournament: true,
        player1: true,
        player2: true,
        // referee: true,
      },
    });
    const body = context.switchToHttp().getRequest().body;
    context.switchToHttp().getRequest().body = { body, match, referee };
    return next.handle();
  }
}
