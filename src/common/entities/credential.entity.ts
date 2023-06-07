import { Column, Entity } from 'typeorm';
import { Node } from '../../pagination/entities/node.entity';

@Entity()
export class Credential extends Node {
  @Column()
  token: string;

  @Column()
  refreshToken: string;
}
