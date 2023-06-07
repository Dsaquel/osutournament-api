import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lobby } from '../entities/lobby/lobby.entity';
import { CreateLobbyDto, UpdateLobbyDto } from '../dto/lobby.dto';
import { SuperReferee } from 'src/tournament/entities/referee/super.referee.entity';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { QualifierService } from './qualifier.service';
import { RefereeService } from 'src/tournament/services/referee.service';
import { QualifierParticipantService } from './participant.qualifier.service';
import { User } from 'src/user/entities/user.entity';

type StaffAsSuperReferee = 'admin' | 'owner' | 'referee';

@Injectable()
export class LobbyService {
  constructor(
    @InjectRepository(Lobby)
    private readonly lobbies: Repository<Lobby>,
    @InjectRepository(SuperReferee)
    private readonly superReferees: Repository<SuperReferee>,
    private readonly qualifierService: QualifierService,
    private readonly tournamentService: TournamentService,
    private readonly refereeService: RefereeService,
    private readonly qualifierParticipantService: QualifierParticipantService,
  ) {}
  async createLobby(
    lobbyDto: CreateLobbyDto,
    userId: number,
    qualifierId: number,
  ) {
    const { relationType, relationId } = await this.findRelation(
      qualifierId,
      userId,
    );

    let superReferee = await this.findSuperReferee(relationType, relationId);

    if (!superReferee) {
      superReferee = await this.createSuperReferee(relationType, relationId);
    }

    return await this.lobbies
      .create({
        superRefereeId: superReferee.id,
        qualifierId,
        schedule: lobbyDto.schedule,
      })
      .save();
  }

  async findLobbies(qualifierId: number) {
    try {
      return await this.lobbies.find({ where: { qualifierId } });
    } catch (e) {
      console.log(e);
    }
  }

  async findRelation(
    qualifierId: number | undefined = undefined,
    userId: number,
    tournamentIdArg: number | undefined = undefined,
  ) {
    const tournamentId = qualifierId
      ? (await this.qualifierService.findOne(qualifierId)).tournamentId
      : tournamentIdArg;
    const { isAdmin, isOwner, isReferee } =
      await this.tournamentService.controlAccess(tournamentId, userId);

    const relationId = isOwner
      ? (await this.tournamentService.findOne(tournamentId)).id
      : isAdmin
      ? (
          await this.tournamentService.findOneAdminByUserId(
            tournamentId,
            userId,
          )
        ).id
      : isReferee
      ? (await this.refereeService.findByIds(tournamentId, userId, true)).id
      : null;

    const relationType: StaffAsSuperReferee = isOwner
      ? 'owner'
      : isAdmin
      ? 'admin'
      : 'referee';

    if (!relationId) throw 'user not in staff';

    return { relationType, relationId };
  }

  async findSuperReferee(
    relationType: StaffAsSuperReferee,
    relationId: number,
  ) {
    return await this.superReferees.findOne({
      where: {
        type: relationType,
        adminId: relationType === 'admin' ? relationId : null,
        ownerId: relationType === 'owner' ? relationId : null,
        refereeId: relationType === 'referee' ? relationId : null,
      },
    });
  }

  async createSuperReferee(
    relationType: StaffAsSuperReferee,
    relationId: number,
  ) {
    return await this.superReferees
      .create({
        type: relationType,
        adminId: relationType === 'admin' ? relationId : null,
        ownerId: relationType === 'owner' ? relationId : null,
        refereeId: relationType === 'referee' ? relationId : null,
      })
      .save();
  }

  async addParticipantToLobby(
    user: User,
    qualifierId: number,
    lobbyId: number,
  ) {
    try {
      const participant = await this.qualifierParticipantService.findOne(
        user.id,
        qualifierId,
      );
      const hasLobby = await this.lobbies.findOne({
        where: { participantsLobby: { id: user.id } },
      });
      if (!participant) throw new BadRequestException('not able to join');
      if (hasLobby) throw new BadRequestException('user have a lobby');
      const lobby = await this.lobbies.findOne({
        where: { id: lobbyId },
        cache: false,
      });
      lobby.participantsLobby.push(user);
      await lobby.save();
    } catch (e) {
      throw new BadRequestException(e.message ? e.message : 'cannot create', e);
    }
  }

  async deleteLobby(id: number, qualifierId: number) {
    try {
      const lobbyToDelete = await this.lobbies.findOne({ where: { id } });
      if (!lobbyToDelete) throw new NotFoundException('no lobby to delete');
      await this.lobbies.remove(lobbyToDelete);
      return await this.lobbies.find({ where: { qualifierId } });
    } catch (e) {
      console.log(e);
    }
  }

  async updateLobby(
    updateLobbyDto: UpdateLobbyDto,
    userId: number,
    qualifierId: number,
    lobbyId: number,
  ) {
    const { relationType, relationId } = await this.findRelation(
      qualifierId,
      userId,
    );

    const superReferee = await this.findSuperReferee(relationType, relationId);

    if (!superReferee) {
      await this.createSuperReferee(relationType, relationId);
    }

    const lobby = await this.lobbies.findOne({ where: { id: lobbyId } });

    if (!lobby) throw new NotFoundException('didnt find lobby');

    Object.assign(lobby, updateLobbyDto);
    await lobby.save();
    return await this.lobbies.find({ where: { qualifierId } });
  }

  async adminGuard(qualifierId: number, userId: number) {
    const { relationType, relationId } = await this.findRelation(
      qualifierId,
      userId,
    );

    const superReferee = await this.findSuperReferee(relationType, relationId);

    if (!superReferee) {
      await this.createSuperReferee(relationType, relationId);
    }
  }
}
