import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/user/entities/user.entity';
import { Tournament } from '../entities/tournament/tournament.entity';
import { MappoolerService } from '../services/mappooler.service';
import { RefereeService } from '../services/referee.service';
import { TournamentService } from '../services/tournament.service';

@Injectable()
export class ParticipantInterceptor implements NestInterceptor {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly refereeService: RefereeService,
    private readonly mappoolerService: MappoolerService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tournament = await this.tournamentService.findOne(request.params.id);

    console.log('participant interceptor');
    (request.user as User).id = 3;
    (request.user as User).rank = 10;

    const isUserInStaff = await this.tournamentService.isUserStaffValidate(
      tournament.id,
      (request.user as User).id,
    );
    if (isUserInStaff)
      throw new ConflictException(
        'You have already one or more participation validate in the staff',
      );
    const participationAsStaffOfUser =
      await this.tournamentService.participationOfUser(
        tournament.id,
        (request.user as User).id,
      );
    if (participationAsStaffOfUser.participationAsAdmin) {
      await this.tournamentService.removeAdminUnValidateByUserId(
        tournament.id,
        (request.user as User).id,
      );
    }
    if (participationAsStaffOfUser.participationAsMappooler) {
      await this.mappoolerService.removeMappoolerUnValidateByUserId(
        tournament.id,
        (request.user as User).id,
      );
    }
    if (participationAsStaffOfUser.participationAsReferee) {
      await this.refereeService.removeRefereeUnValidateByUserId(
        tournament.id,
        (request.user as User).id,
      );
    }
    const condition = tournament.rangePlayerMax
      ? (request.user as User).rank >= tournament.rangePlayerMin &&
        (request.user as User).rank <= tournament.rangePlayerMax
      : (request.user as User).rank >= tournament.rangePlayerMin;

    if (!condition) throw new BadRequestException('participant not in range ');
    return next.handle();
  }
}
