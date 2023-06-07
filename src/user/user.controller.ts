import {
  Controller,
  Get,
  Inject,
  Query,
  Req,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';
import { DraftService } from 'src/tournament/services/draft.service';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TournamentService } from 'src/tournament/services/tournament.service';

@UseGuards(LoggedInGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly draftService: DraftService,
    @Inject(forwardRef(() => TournamentService))
    private readonly tournamentService: TournamentService,
  ) {}

  @Get('me')
  async findCurrent(@Req() req: Request) {
    return await this.userService.findOneWithNotification(
      (req.user as User).id,
    );
  }

  @Get('drafts')
  async findUserDrafts(@Req() req: Request) {
    return await this.draftService.findAllDraftUser((req.user as User).id);
  }

  @Get()
  async finUsersByUsername(@Query('username') username: string) {
    return await this.userService.finUsersByUsername(username);
  }

  @Get('involvement')
  async findUserInvolvement(@Req() req: Request) {
    return await this.tournamentService.findUserInvolvement(
      (req.user as User).id,
    );
  }
}
