import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CheckUserAbility } from '../../ability/ability.decorator';
import { UserGuard } from '../../ability/guards/user.guard';
import { LoggedInGuard } from '../../auth/guards/logged-in.guard';
import { DraftService } from '../services/draft.service';
import { User } from '../../user/entities/user.entity';
import { Action } from 'src/ability/ability.factory';
import { Draft } from '../entities/draft/draft.entity';
import { DraftDto, UpdateDraftDto, UpdatePublication } from '../dto/draft.dto';
import { TournamentService } from '../services/tournament.service';

@Controller('draft')
export class DraftController {
  constructor(
    private readonly draftService: DraftService,
    private readonly tournamentService: TournamentService,
  ) {}

  @Get()
  async findAllDraftUnStarted() {
    return await this.draftService.findAllDraftUnStarted();
  }

  // TODO: here
  @CheckUserAbility({ action: Action.PrivateRead, subject: Draft })
  @Get(':id')
  async findDraftUser(@Param('id') draftId: string): Promise<Draft> {
    return await this.draftService.findDraft(+draftId);
  }

  @UseGuards(LoggedInGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body() draftDto: DraftDto,
  ): Promise<Draft> {
    const user = req.user as User;
    const createDraft = await this.draftService.create(user, draftDto);
    await this.tournamentService.create(user, draftDto, createDraft);
    return createDraft;
  }

  @UseGuards(LoggedInGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateDraftDto: UpdateDraftDto,
  ): Promise<Draft> {
    const draft = await this.draftService.findOne(+id);
    const isAdmin = await this.tournamentService.findOneAdminByUserId(
      draft.tournament.id,
      (req.user as User).id,
    );
    if (draft.ownerId === (req.user as User).id || isAdmin) {
      return await this.draftService.update(
        req.user as User,
        +id,
        updateDraftDto,
      );
    }
    throw new BadRequestException('only admins or owner can update draft');
  }

  //NOTE: different to update because i want later to do something special here idk now
  @UseGuards(LoggedInGuard)
  @Put(':id/public')
  async updatePrivacy(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updatePublication: UpdatePublication,
  ) {
    const draft = await this.draftService.findOne(+id);
    const isAdmin = await this.tournamentService.findOneAdminByUserId(
      draft.tournament.id,
      (req.user as User).id,
    );
    if (draft.ownerId === (req.user as User).id || isAdmin) {
      return await this.draftService.updatePrivacy(
        +id,
        updatePublication.isPublic,
      );
    }
    throw new BadRequestException('only admins or owner can update privacy');
  }
}
