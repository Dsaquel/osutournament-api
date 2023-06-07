import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { ParticipantMapScore } from './participant.map.score.entity';
import { QualifierParticipantService } from '../../services/participant.qualifier.service';

@Injectable()
export class MapScoreSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() readonly connection: DataSource,
    private readonly participantsQualifierService: QualifierParticipantService,
  ) {
    connection.subscribers.push(this);
  }

  public listenTo() {
    return ParticipantMapScore;
  }

  async afterUpdate(event: UpdateEvent<ParticipantMapScore>): Promise<void> {
    // try {
    //   await this.participantsQualifierService.updateAfterInsert(
    //     event.entity.participantId,
    //     event.entity.rank,
    //     event.entity.score,
    //   );
    // } catch (e) {
    //   throw new BadRequestException(
    //     e.message ? e.message : 'cannot start job',
    //     e,
    //   );
    // }
  }
}
