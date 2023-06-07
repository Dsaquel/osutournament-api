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
import { LoggedInGuard } from '../../auth/guards/logged-in.guard';
import { Tournament } from '../entities/tournament/tournament.entity';
import { Action } from '../../ability/ability.factory';
import { CheckAbilities } from '../../ability/ability.decorator';
import { OwnerGuard } from '../../ability/guards/abilities.guard';
import { MappoolerService } from '../services/mappooler.service';
import { DateInterceptor } from '../interceptors/date.interceptor';
import { Mappooler } from '../entities/mappool/mappooler.entity';
import { User } from 'src/user/entities/user.entity';

@Controller('tournament/:id/mappooler')
@UseGuards(LoggedInGuard, OwnerGuard)
@UseInterceptors(DateInterceptor)
export class MappoolerController {
  constructor(private readonly mappoolerService: MappoolerService) {}

  @Get()
  @CheckAbilities({ action: Action.PrivateRead, subject: Mappooler })
  async findAll(@Param('id') id: string) {
    return await this.mappoolerService.findAll(+id);
  }

  @Get('validate')
  @CheckAbilities({ action: Action.PrivateRead, subject: Mappooler })
  async findAllValidate(@Param('id') id: string) {
    return await this.mappoolerService.findAllValidate(+id);
  }

  @Post()
  @CheckAbilities({ action: Action.Create, subject: Mappooler })
  async create(@Req() req: any, @Body('tournament') tournament: Tournament) {
    // return await this.mappoolerService.create(tournament, req.user);
  }

  @Put(':userId')
  @CheckAbilities({ action: Action.Update, subject: Mappooler })
  async update(
    @Param('userId') userId: User['id'],
    @Body('tournament') tournament: Tournament,
    @Body('body') body: any,
  ) {
    return await this.mappoolerService.update(
      tournament,
      userId,
      body.validate,
    );
  }
}
