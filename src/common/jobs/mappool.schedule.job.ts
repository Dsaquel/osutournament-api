import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Mappool } from 'src/common/entities/mappool.entity';
import { TournamentMappoolService } from 'src/tournament/services/mappool.tournament.service';
import { MappoolService } from '../services/mappool.service';

@Injectable()
export class MappoolScheduleJob {
  constructor(
    @InjectQueue('mappoolSchedule')
    private readonly mappoolScheduleQueue: Queue,
    private readonly mappoolService: MappoolService,
    private readonly tournamentMappoolService: TournamentMappoolService,
  ) {}

  async jobCrud(mappoolId: number) {
    const job = await this.mappoolScheduleQueue.getJob(mappoolId);
    const mappool =
      (await this.mappoolService.findOne(mappoolId)) ??
      (await this.tournamentMappoolService.findOneById(mappoolId));

    if (mappool.displayMappoolsSchedule && job) this.updateJob(job, mappool);
    if (mappool.displayMappoolsSchedule && !job) this.createJob(mappool);
    if (!mappool.displayMappoolsSchedule && job) this.removeJob(job);
  }

  async startJob(mappoolId: Mappool['id']) {
    const job = await this.mappoolScheduleQueue.getJob(mappoolId);
    await job.promote();
  }

  async createJob(mappool: Mappool) {
    console.log('Mappool create');
    const delay = Date.parse(mappool.displayMappoolsSchedule) - Date.now();
    await this.mappoolScheduleQueue.add('dispayMappoolSchedule', mappool.id, {
      delay,
      jobId: mappool.id,
      removeOnComplete: true,
    });
  }

  async updateJob(job: Job, qualifier: Mappool) {
    console.log('update mappool');
    await job.moveToFailed({ message: 'removed' }, true);
    await this.createJob(qualifier);
  }

  async removeJob(job: Job) {
    console.log('remove mappool');
    await job.moveToFailed({ message: 'removed' });
  }
}
