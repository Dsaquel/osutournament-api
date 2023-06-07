import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Tournament } from '../entities/tournament/tournament.entity';
import { TournamentService } from '../services/tournament.service';

@Injectable()
export class TournamentStartDateJob {
  constructor(
    @InjectQueue('startTournament')
    private readonly startTournamentQueue: Queue,
    private readonly tournamentService: TournamentService,
  ) {}

  async jobCrud(tournamentId: Tournament['id']) {
    const job = await this.startTournamentQueue.getJob(tournamentId);
    const tournament = await this.tournamentService.findOne(tournamentId);
    if (tournament.startDate && job) this.updateJob(job, tournament);
    if (tournament.startDate && !job) this.createJob(tournament);
    if (!tournament.startDate && job) this.removeJob(job);
  }

  async startJob(tournamentId: Tournament['id']) {
    try {
      console.log('1');
      const job = await this.startTournamentQueue.getJob(tournamentId);
      console.log(await job.getState());
      job.promote();
      console.log('2');
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        e.message ? e.message : 'cannot start job',
        e,
      );
    }
  }

  async createJob(tournament: Tournament) {
    console.log('JOB START DATE CREATE');
    const delay = Date.parse(tournament.startDate) - Date.now();
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
