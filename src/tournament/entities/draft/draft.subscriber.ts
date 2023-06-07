import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { Draft } from './draft.entity';

@Injectable()
export class DraftSubscriber implements EntitySubscriberInterface {
  constructor(@InjectDataSource() readonly connection: DataSource) {
    connection.subscribers.push(this);
  }

  public listenTo() {
    return Draft;
  }

  async afterUpdate(event: UpdateEvent<Draft>) {
    if (!event.entity) return;

    if (event.entity.isPublic || event.entity.isPublicable) return;

    const condition =
      !!event.entity.name &&
      !!event.entity.details &&
      !!event.entity.numbersPlayers &&
      !!event.entity.estimateStartDate;

    if (condition) {
      await event.manager
        .createQueryBuilder()
        .update(Draft)
        .set({ isPublicable: true })
        .where('id = :id', { id: event.entity.id })
        .execute();
    }
  }
}
