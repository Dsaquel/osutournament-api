import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { MappoolScheduleJob } from '../jobs/mappool.schedule.job';
import { DataSource, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { Mappool } from './mappool.entity';

@Injectable()
export class MappoolSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() readonly connection: DataSource,
    private readonly mappoolScheduleJob: MappoolScheduleJob,
  ) {
    connection.subscribers.push(this);
  }

  public listenTo() {
    return Mappool;
  }

  async afterUpdate(event: UpdateEvent<Mappool>): Promise<any> {
    if (!event.entity) return;
    await this.mappoolScheduleJob.jobCrud(event.entity.id as Mappool['id']);
  }
}
