import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TournamentEndRegistrationJob } from 'src/tournament/jobs/registration.end.job';
import { TournamentStartDateJob } from 'src/tournament/jobs/start.tournament.job';
import { TournamentService } from 'src/tournament/services/tournament.service';
import { DataSource, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { Tournament } from './tournament.entity';

@Injectable()
export class TournamentSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() readonly connection: DataSource,
    private readonly tournamentService: TournamentService,
    private readonly tournamentStartDateJob: TournamentStartDateJob,
    private readonly tournamentEndRegistrationJob: TournamentEndRegistrationJob,
  ) {
    connection.subscribers.push(this);
  }

  public listenTo() {
    return Tournament;
  }

  async beforeUpdate(event: UpdateEvent<Tournament>) {
    if (!event.entity) return;

    if (event.entity.winnerId) {
      await event.manager
        .createQueryBuilder()
        .update(Tournament)
        .set({ isFinished: true })
        .where('id = :id', { id: event.entity.id })
        .execute();
      return;
    }
    const tournament = await this.tournamentService.findOne(event.entity.id);

    if (
      tournament.startDate !== event.entity.startDate &&
      !tournament.registrationEnd
    ) {
      this.tournamentStartDateJob.jobCrud(tournament.id);
    }

    if (
      tournament.registrationEndDate !== event.entity.registrationEndDate &&
      !tournament.registrationEnd
    ) {
      this.tournamentEndRegistrationJob.jobCrud(tournament.id);
    }

    if (event.entity.isPublic || event.entity.isPublicable) return;

    const condition =
      !!event.entity.name &&
      !!event.entity.description &&
      !!event.entity.numbersPlayers &&
      !!event.entity.startDate &&
      !!event.entity.registrationEndDate;

    if (condition) {
      await event.manager
        .createQueryBuilder()
        .update(Tournament)
        .set({ isPublicable: true })
        .where('id = :id', { id: event.entity.id })
        .execute();
    }
  }
}
