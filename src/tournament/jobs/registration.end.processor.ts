import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { QualifierParticipantService } from 'src/qualifier/services/participant.qualifier.service';
import { Tournament } from '../entities/tournament/tournament.entity';
import { TournamentService } from '../services/tournament.service';

@Processor('registrationEndDate')
export class TournamentRegistrationEndProcessor {
  constructor(
    @Inject(TournamentService)
    private readonly tournamentService: TournamentService,
  ) {}

  @Process('create')
  async create(job: Job<Tournament>) {
    console.log('job end registration', job.data);
    await this.tournamentService.updateRegistrationEnd(job.data.id, true);
  }
}
