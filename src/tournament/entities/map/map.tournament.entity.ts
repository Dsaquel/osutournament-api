import { Column, Entity, ManyToOne } from 'typeorm';
import { Map } from 'src/common/entities/map.entity';
import { TournamentMappool } from 'src/common/entities/mappool.entity';

@Entity()
export class TournamentMap extends Map {
  @ManyToOne(
    () => TournamentMappool,
    (tournamentMappool) => tournamentMappool.maps,
  )
  mappool: TournamentMappool;

  @Column()
  tournamentId: number
}
