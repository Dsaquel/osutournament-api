import { Column, Entity } from 'typeorm';
import { MapType } from '../helper/types.helper';
import { Node } from 'src/pagination/entities/node.entity';

@Entity()
export abstract class Map extends Node {
  @Column({
    transformer: {
      from: (value: string) => JSON.parse(value),
      to: (value: object) => JSON.stringify(value),
    },
  })
  osuBeatmap: string;

  @Column({ default: 'noMod' })
  type: MapType;

  @Column({ default: 1 })
  numberOfType: number;

  @Column()
  beatmapsetId: number;

  @Column()
  beatmapId: number;

  @Column()
  mappoolId: number;
}

export interface IMap {
  osuBeatmap: string;
  type: MapType;
  numberOfType: number;
  beatmapsetId: number;
  beatmapId: number;
  mappoolId: number;
}
