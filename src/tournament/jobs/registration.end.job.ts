import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Tournament } from '../entities/tournament/tournament.entity';
import { TournamentService } from '../services/tournament.service';

@Injectable()
export class TournamentEndRegistrationJob {
  constructor(
    @InjectQueue('registrationEndDate')
    private readonly startTournamentQueue: Queue,
    private readonly tournamentService: TournamentService,
  ) {}

  async jobCrud(tournamentId: number) {
    const job = await this.startTournamentQueue.getJob(tournamentId);
    const tournament = await this.tournamentService.findOne(tournamentId);
    if (tournament.registrationEndDate && job) this.updateJob(job, tournament);
    if (tournament.registrationEndDate && !job) this.createJob(tournament);
    if (!tournament.registrationEndDate && job) this.removeJob(job);
  }

  async startJob(tournamentId: number) {
    const job = await this.startTournamentQueue.getJob(tournamentId);
    await job.promote();
  }

  async createJob(tournament: Tournament) {
    console.log('JOB REGISTRATION END CREATE');
    const delay = Date.parse(tournament.registrationEndDate) - Date.now();
    await this.startTournamentQueue.add('create', tournament, {
      delay,
      jobId: tournament.id,
    });
  }

  async updateJob(job: Job, tournament: Tournament) {
    await job.remove();
    this.createJob(tournament);
  }

  async removeJob(job: Job) {
    await job.remove();
  }
}
