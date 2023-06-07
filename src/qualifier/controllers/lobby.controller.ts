import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateLobbyDto, UpdateLobbyDto } from '../dto/lobby.dto';
import { LobbyService } from '../services/lobby.service';
import { LoggedInGuard } from 'src/auth/guards/logged-in.guard';
import { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { QualifierParticipantService } from '../services/participant.qualifier.service';
import { UserService } from 'src/user/user.service';

@Controller('qualifier/:qualifierId/lobby')
export class LobbyController {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly qualifierParticipantService: QualifierParticipantService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(LoggedInGuard)
  async create(
    @Req() req: Request,
    @Body() createLobbyDto: CreateLobbyDto,
    @Param('qualifierId') qualifierId: string,
  ) {
    return await this.lobbyService.createLobby(
      createLobbyDto,
      (req.user as User).id,
      +qualifierId,
    );
  }

  @Put(':lobbyId')
  @UseGuards(LoggedInGuard)
  async update(
    @Req() req: Request,
    @Body() updateLobbyDto: UpdateLobbyDto,
    @Param('qualifierId') qualifierId: string,
    @Param('lobbyId') lobbyId: string,
  ) {
    return await this.lobbyService.updateLobby(
      updateLobbyDto,
      (req.user as User).id,
      +qualifierId,
      +lobbyId,
    );
  }

  @Post(':lobbyId/participant')
  @UseGuards(LoggedInGuard)
  async addParticipantToLobby(
    @Req() req: Request,
    @Param('qualifierId') qualifierId: string,
    @Param('lobbyId') lobbyId: string,
  ) {
    const developmentUser = await this.userService.findOne(6);
    await this.lobbyService.addParticipantToLobby(
      developmentUser,
      +qualifierId,
      +lobbyId,
    );
    return await this.lobbyService.findLobbies(+qualifierId);
  }

  @Delete(':lobbyId')
  @UseGuards(LoggedInGuard)
  async deleteLobby(
    @Param('qualifierId') qualifierId: string,
    @Param('lobbyId') lobbyId: string,
  ) {
    return await this.lobbyService.deleteLobby(+lobbyId, +qualifierId);
  }

  @Get()
  @UseGuards(LoggedInGuard)
  async findAll(@Param('qualifierId') qualifierId: string) {
    return await this.lobbyService.findLobbies(+qualifierId);
  }
}
