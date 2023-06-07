import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';
import { Tournament } from '../entities/tournament/tournament.entity';
import { Action } from 'src/ability/ability.factory';
import { CheckAbilities } from 'src/ability/ability.decorator';
import { OwnerGuard } from 'src/ability/guards/abilities.guard';
import { RefereeService } from '../services/referee.service';
import { DateInterceptor } from '../interceptors/date.interceptor';
import { Referee } from '../entities/referee/referee.entity';
import { User } from 'src/user/entities/user.entity';

@Controller('tournament/:id/referee')
@UseGuards(LoggedInGuard, OwnerGuard)
@UseInterceptors(DateInterceptor)
export class RefereeController {
  constructor(private readonly refereeService: RefereeService) {}
  @Get()
  @CheckAbilities({ action: Action.PrivateRead, subject: Referee })
  async findAll(@Param('id') id: string) {
    return await this.refereeService.findAll(+id);
  }

  @Get('validate')
  @CheckAbilities({ action: Action.PrivateRead, subject: Referee })
  async findAllValidate(@Param('id') id: string) {
    return await this.refereeService.findAllValidate(+id);
  }

  @Post()
  @CheckAbilities({ action: Action.Create, subject: Referee })
  async referee(@Req() req: any, @Body('tournament') tournament: Tournament) {
    // return await this.refereeService.create(tournament, req.user);
  }

  @CheckAbilities({ action: Action.Update, subject: Referee })
  @Put(':userId')
  async update(
    @Param('userId') userId: User['id'],
    @Body('tournament') tournament: Tournament,
    @Body('body') body: any,
  ) {
    return await this.refereeService.update(
      tournament,
      userId,
      body.validate as boolean,
    );
  }
}
