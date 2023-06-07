import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { QualifierParticipantService } from 'src/qualifier/services/participant.qualifier.service';
import {
  ParticipantIndividual,
  ParticipantTeam,
} from '../entities/participant/participant.entity';
import { Tournament } from '../entities/tournament/tournament.entity';
import { TournamentService } from '../services/tournament.service';

@Processor('startTournament')
export class TournamentStartProcessor {
  constructor(
    @Inject(TournamentService)
    private readonly tournamentService: TournamentService,
    @Inject(QualifierParticipantService)
    private readonly qualifierParticipantService: QualifierParticipantService,
  ) {}

  @Process('create')
  async create(job: Job<Tournament>) {
    try {
      const tournament = await this.tournamentService.findOne(job.data.id);
      await this.tournamentService.updateRegistrationEnd(tournament.id, true);
      if (tournament.hasQualifier) {
        for await (const participant of tournament.participants as
          | ParticipantIndividual[]
          | ParticipantTeam[]) {
          await this.qualifierParticipantService.create(
            participant,
            tournament.qualifier.id,
          );
        }
      } else {
        await this.tournamentService.createBracketPhase(tournament.id);
      }
    } catch (e) {
      throw new BadRequestException(e.message ? e : 'cannot fetch', e);
    }
  }
}
