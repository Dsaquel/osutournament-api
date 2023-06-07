import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MappoolService } from '../services/mappool.service';

@Processor('mappoolSchedule')
export class DisplayMappoolProcessor {
  constructor(private readonly mappoolService: MappoolService) {}

  @Process('dispayMappoolSchedule')
  async create(job: Job): Promise<void> {
    // mappool id
    const id: number = job.data;
    await this.mappoolService.updateMappoolShow(id);
  }
}
