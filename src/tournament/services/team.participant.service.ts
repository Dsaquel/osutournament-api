import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Tournament } from '../entities/tournament/tournament.entity';
import { ParticipantTeam } from '../entities/participant/participant.entity';
import { TParticipantToPlayer } from 'src/common/helper/types.helper';
import { AddParticipantTeamDto } from '../dto/create-team-dto';
import {
  ParticipantRequest,
  ParticipantInvitation,
} from '../entities/participant/invitation.team.entity';
import { User } from 'src/user/entities/user.entity';
import * as helpers from 'src/match/helpers/functions';

@Injectable()
export class ParticipantTeamService {
  constructor(
    @InjectRepository(ParticipantTeam)
    private readonly participantTeams: Repository<ParticipantTeam>,
    @InjectRepository(ParticipantRequest)
    private readonly participantRequest: Repository<ParticipantRequest>,
    @InjectRepository(ParticipantInvitation)
    private readonly participantInvitations: Repository<ParticipantInvitation>,
  ) {}

  async findAll(tournamentId: number, tournament: Tournament) {
    try {
      return await this.participantTeams.find({
        where: {
          tournamentId,
        },
        relations: { users: true },
      });
    } catch (e) {
      throw new NotFoundException('cannot find participants');
    }
  }

  async create(
    user: User,
    tournamentId: number,
    addParticipantTeamDto: AddParticipantTeamDto,
  ) {
    try {
      if (addParticipantTeamDto.teamId) {
        console.log(user);
        const userRequestExist = await this.participantRequest.findOne({
          where: {
            userRequestId: user.id,
            tournamentId,
            participantTeamId: addParticipantTeamDto.teamId,
          },
        });
        if (userRequestExist)
          throw new ConflictException('Already send request');
        await this.participantRequest
          .create({
            tournamentId,
            participantTeamId: addParticipantTeamDto.teamId,
            status: 'pending',
            userRequestId: user.id,
          })
          .save();
        const team = (await this.participantTeams.findOne({
          where: { id: addParticipantTeamDto.teamId },
          select: { name: true },
        })) as { name: string };
        return {
          subject: 'Invitation',
          message: `You sent an request for ${team.name}.`,
        };
      }
      await this.participantTeams
        .create({
          tournamentId,
          captainId: user.id,
          name: addParticipantTeamDto.teamName,
          validate: false,
          users: [user],
        })
        .save();
      return {
        subject: 'Congrat !',
        message: `Team ${addParticipantTeamDto.teamName} has been created`,
      };
    } catch (e) {
      throw new BadRequestException(
        e.message ? e : 'cannot insert participant',
        e,
      );
    }
  }

  /**
   * TODO: to test
   */
  async findParticipantsWithSeed(tournamentId: number, numbersPlayers: number) {
    try {
      const participants = await this.participantTeams.find({
        where: { tournamentId, validate: true },
        take: numbersPlayers,
      });

      const participantsOutput: TParticipantToPlayer[] = [];
      const seeding = helpers.shuffleArray(helpers.getSeeding(numbersPlayers));
      //TODO: get by pp score
      for (let i = 1; i <= numbersPlayers; i++) {
        const participantOutput: TParticipantToPlayer = Object.assign(
          participants[i - 1],
          { seed: seeding.shift() },
        );
        participantsOutput.push(participantOutput);
      }
      return participantsOutput;
    } catch (e) {
      throw new BadRequestException(
        e.message ? e : 'cannot find participants with seed',
        e,
      );
    }
  }

  /**
   * TODO: to test
   */
  async removeByUserId(userId: number, tournamentId: number) {
    try {
      const participant = await this.participantTeams.findOne({
        where: { tournamentId, users: { id: userId } },
        relations: { users: true },
      });
      if (!participant) return;
      participant.users = participant.users.filter(
        (user) => user.id !== userId,
      );
      await participant.save();
    } catch (e) {
      throw new BadRequestException(
        e.message ? e : 'cannot delete participant',
        e,
      );
    }
  }

  async udpateValidation(id: number, tournamentId: number, validate: boolean) {
    const participant = await this.participantTeams.findOne({
      where: { tournamentId, id },
    });
    if (!participant) throw new NotFoundException('cannot find participant');
    participant.validate = validate;
    await participant.save();
    return {
      subject: 'Participant',
      message: validate ? `Participant validate` : `Participant unvalidate`,
    };
  }

  async fetchParticipationOfParticipantTeam(
    userId: number,
    tournamentId: number,
  ) {
    try {
      const participantRequestIds = (
        (await this.participantRequest.find({
          where: { userRequestId: userId, tournamentId },
          select: { participantTeamId: true },
        })) as { participantTeamId: number }[]
      ).map((res) => res.participantTeamId);

      const participantInvitationIds = (
        (await this.participantInvitations.find({
          where: { userInvitedId: userId, tournamentId },
          select: { participantTeamId: true },
        })) as { participantTeamId: number }[]
      ).map((res) => res.participantTeamId);

      return participantInvitationIds.concat(participantRequestIds);
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }

  async fetchParticipantTeamRequests(
    userId: number,
    participantTeamId: number,
  ) {
    try {
      return await this.participantRequest.find({
        where: {
          status: Not('accepted'),
          participantTeamId,
          participantTeam: { captainId: userId },
        },
        relations: { userRequest: true },
      });
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }

  async fetchParticipantTeamInvitations(
    userId: number,
    participantTeamId: number,
  ) {
    try {
      return await this.participantInvitations.find({
        where: {
          status: Not('accepted'),
          participantTeamId,
          participantTeam: { captainId: userId },
        },
        relations: { userInvited: true },
      });
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }

  async updateRequestStatus(
    requestId: number,
    status: 'accepted' | 'declined',
  ) {
    try {
      if (status === 'declined') {
        const request = await this.participantRequest.findOne({
          where: { id: requestId },
        });
        request.status = status;
        await request.save();
        return {
          subject: 'Request status',
          message: 'request declined',
        };
      }
      const request = await this.participantRequest.findOne({
        where: { id: requestId },
        relations: { userRequest: true },
      });

      request.status = 'accepted';
      await request.save();
      const team = await this.participantTeams.findOne({
        where: { id: request.participantTeamId },
        relations: { users: true, tournament: true },
      });

      team.users.push(request.userRequest);
      if (
        !team.validate &&
        team.users.length >= team.tournament.teamNumberMin
      ) {
        team.validate = true;
      }
      await this.participantTeams.save(team);
      return {
        subject: 'Request status',
        message: 'request accepted',
      };
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }

  async updateInvitationStatus(
    invitationId: number,
    status: 'accepted' | 'declined',
  ) {
    try {
      console.log('0');
      if (status === 'declined') {
        const invitation = await this.participantInvitations.findOne({
          where: { id: invitationId },
        });
        console.log('1', invitation);
        invitation.status = status;
        console.log('2');
        console.log(status);
        await invitation.save();
        console.log('3');
        return {
          subject: 'Invitation status',
          message: `invitation declined`,
        };
      }
      const invitation = await this.participantInvitations.findOne({
        where: { id: invitationId },
        relations: { userInvited: true },
      });

      invitation.status = 'accepted';
      await invitation.save();
      const team = await this.participantTeams.findOne({
        where: { id: invitation.participantTeamId },
        relations: { users: true, tournament: true },
      });

      team.users.push(invitation.userInvited);
      if (
        !team.validate &&
        team.users.length >= team.tournament.teamNumberMin
      ) {
        team.validate = true;
      }
      await this.participantTeams.save(team);
      return {
        subject: 'Invitation status',
        message: `joined ${team.name}`,
      };
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }

  async sendInvitationsToUsers(
    teamId: number,
    tournamentId: number,
    usersId: number[],
  ) {
    try {
      for await (const userId of usersId) {
        await this.participantInvitations
          .create({
            participantTeamId: teamId,
            tournamentId,
            userInvitedId: userId,
          })
          .save();
      }
      return {
        subject: 'Invitations',
        message: usersId.length === 1 ? 'user invited' : 'users invited',
      };
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }
}
