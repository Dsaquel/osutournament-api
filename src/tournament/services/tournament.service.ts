import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { Tournament } from '../entities/tournament/tournament.entity';
import { User } from 'src/user/entities/user.entity';
import { Draft } from '../entities/draft/draft.entity';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { MappoolerService } from './mappooler.service';
import { RefereeService } from './referee.service';
import { Admin } from '../entities/admin/admin.entity';
import { MatchService } from 'src/match/services/match.service';
import { ParticipantIndividualService } from './individual.participant.service';
import { TournamentType } from 'src/common/helper/enum.helper';
import { ParticipantTeamService } from './team.participant.service';

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournaments: Repository<Tournament>,
    @InjectRepository(Admin)
    private readonly admins: Repository<Admin>,
    private readonly mappoolerService: MappoolerService,
    private readonly refereeService: RefereeService,
    private readonly matchService: MatchService,
    private readonly participantIndividualService: ParticipantIndividualService,
    private readonly participantTeamService: ParticipantTeamService,
  ) {}

  async controlAccess(id: number, userId: number) {
    const isOwner = await this.tournaments.findOne({
      where: { id, ownerId: userId },
    });
    const isMappooler = await this.mappoolerService.findByIds(id, userId, true);
    const isReferee = await this.refereeService.findByIds(id, userId, true);
    const isAdmin = await this.admins.findOne({
      where: { tournamentId: id, userId, validate: true },
    });
    return {
      isOwner: !!isOwner,
      isAdmin: !!isAdmin,
      isMappooler: !!isMappooler,
      isReferee: !!isReferee,
    };
  }

  async isUserStaffValidate(id: number, userId: number) {
    const isOwner = await this.tournaments.findOne({
      where: { id, ownerId: userId },
    });
    const isMappooler = await this.mappoolerService.findByIds(id, userId, true);
    const isReferee = await this.refereeService.findByIds(id, userId, true);
    const isAdmin = await this.admins.findOne({
      where: { tournamentId: id, userId, validate: true },
    });
    return !!isOwner || !!isAdmin || !!isMappooler || !!isReferee;
  }

  async findOneAdmin(tournamentId: number, adminId: number) {
    return await this.admins.findOne({ where: { id: adminId, tournamentId } });
  }

  async findOneAdminByUserId(tournamentId: number, userId: number) {
    return await this.admins.findOne({ where: { userId, tournamentId } });
  }

  async participationOfUser(id: number, userId: number) {
    const participationAsMappooler = await this.mappoolerService.findByIds(
      id,
      userId,
    );
    const participationAsReferee = await this.refereeService.findByIds(
      id,
      userId,
    );
    const participationAsAdmin = await this.admins.findOne({
      where: { tournamentId: id, userId },
    });
    return {
      participationAsMappooler: !!participationAsMappooler,
      participationAsReferee: !!participationAsReferee,
      participationAsAdmin: !!participationAsAdmin,
    };
  }

  async findStaff(id: number) {
    const mappoolers = await this.mappoolerService.findAll(id);
    const referees = await this.refereeService.findAll(id);
    const admins = await this.admins.find({
      where: { tournamentId: id },
    });
    return { admins, referees, mappoolers };
  }

  async create(
    user: User,
    draftDto: CreateTournamentDto,
    draft: Draft,
  ): Promise<Tournament> {
    const tournament = this.tournaments.create(draftDto);
    tournament.ownerId = user.id;
    tournament.owner = user;
    tournament.draftId = draft.id;
    tournament.draft = draft;
    return await tournament.save();
  }

  async findAll() {
    try {
      return await this.tournaments.find({
        where: { isPublic: true }, // isFinished false ???
        relations: { participants: true, draft: true },
        take: 25,
      });
    } catch (e) {
      throw new BadRequestException(
        e.message ? e : 'cannot find all tournament',
        e,
      );
    }
  }

  async findOne(id: number): Promise<Tournament> {
    try {
      return await this.tournaments.findOne({
        where: { id },
        relations: { participants: true, draft: true },
      });
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async updateRegistrationEnd(id: number, ending: boolean) {
    try {
      const tournament = await this.tournaments.findOne({ where: { id } });
      tournament.registrationEnd = true;
      await tournament.save();
    } catch (e) {
      throw new BadRequestException(
        e.message ? e : 'cannot update registration end',
        e,
      );
    }
  }
  /**
   *
   * when tournament has no qualifier
   */
  async createBracketPhase(id: number) {
    try {
      const tournament = await this.findOne(id);
      await this.updateBracketPhase(id);
      const participantsSeed =
        tournament.type === TournamentType.Solo
          ? await this.participantIndividualService.findParticipantsWithSeed(
              id,
              tournament.numbersPlayers,
            )
          : await this.participantTeamService.findParticipantsWithSeed(
              id,
              tournament.numbersPlayers,
            );

      return await this.matchService.addPlayers(
        id,
        tournament.numbersPlayers,
        participantsSeed,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async updatePrivacy(id: number, isPublic: boolean) {
    try {
      const tournament = await this.tournaments.findOne({ where: { id } });
      tournament.isPublic = isPublic;
      return await tournament.save();
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async update(
    tournament: Tournament,
    updateTournamentDto: UpdateTournamentDto,
  ): Promise<Tournament> {
    try {
      const updateTournament = await this.tournaments.findOne({
        where: { id: tournament.id },
      });
      Object.assign(updateTournament, updateTournamentDto);
      return await updateTournament.save();
    } catch (e) {
      throw e;
    }
  }

  async updatePrivacity(id: number) {
    const tournament = await this.tournaments.findOne({ where: { id } });
    tournament.isPublic = true;
    tournament.isPublicable = true;
    return await tournament.save();
  }

  async updateBracketPhase(id: number) {
    try {
      const tournament = await this.tournaments.findOne({ where: { id } });
      tournament.isInBracketPhase = true;
      await tournament.save();
    } catch (e) {
      console.log(e);
    }
  }

  async createAdmin(
    tournamentId: number,
    userId: number,
    validate: boolean = false,
  ) {
    try {
      const admin = await this.admins.findOne({
        where: { userId, tournamentId },
      });
      if (admin) {
        throw new ConflictException(
          'you have already participate to this tournament, please wait admins validate you',
        );
      }
      await this.admins.create({ userId, tournamentId, validate }).save();
      return {
        message: !validate
          ? 'well done ! please wait the owner or admins validate you'
          : 'Up to admin !',
        subject: 'admin',
      };
    } catch (e) {
      throw e;
    }
  }

  async validateAdmin(tournamentId: number, adminId: number) {
    const admin = await this.admins.findOne({
      where: { tournamentId, id: adminId },
    });
    if (!admin) throw new NotFoundException('cannot find admin');
    admin.validate = true;
    await admin.save();
  }

  async removeAdmin(tournamentId: number, adminId: number) {
    const admin = await this.admins.findOne({
      where: { tournamentId, id: adminId },
    });
    if (!admin) throw new NotFoundException('cannot find admin');
    await this.admins.remove(admin);
  }

  async removeAdminUnValidateByUserId(tournamentId: number, userId: number) {
    const admin = await this.admins.findOne({
      where: { tournamentId, userId, validate: false },
    });
    if (!admin) return;
    await this.admins.remove(admin);
  }

  async findUserInvolvement(userId: number) {
    try {
      return await this.tournaments
        .createQueryBuilder('tournament')
        .leftJoinAndSelect('tournament.mappoolers', 'mappooler')
        .leftJoinAndSelect('tournament.referees', 'referee')
        .leftJoinAndSelect('tournament.participants', 'participant')
        .leftJoinAndSelect('participant.user', 'participantUser')
        .leftJoinAndSelect('participant.users', 'participantTeamUser')
        .where('mappooler.userId = :userId', { userId })
        .orWhere('referee.userId = :userId', { userId })
        .orWhere('participantUser.id = :userId', { userId })
        .orWhere('participantTeamUser.id = :userId', { userId })
        .getMany();
    } catch (e) {
      console.log(e);
    }
  }
}
