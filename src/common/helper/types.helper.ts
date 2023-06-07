import {
  ParticipantIndividual,
  ParticipantTeam,
} from 'src/tournament/entities/participant/participant.entity';
import { ParticipantType } from './enum.helper';

export type Mods =
  | 'no mod'
  | 'hard rock'
  | 'hidden'
  | 'double time'
  | 'easy'
  | 'half time';

export type MapType =
  | 'noMod'
  | 'hidden'
  | 'hardRock'
  | 'doubleTime'
  | 'freeMod'
  | 'tieBreaker';

export type MappoolType = 'tournament' | 'qualifier';

export type ParticipantToPlayer<T extends ParticipantType> = {
  qualifierParticipant: { seed: number };
} & (T extends ParticipantType.Individual
  ? ParticipantIndividual
  : T extends ParticipantType.Team
  ? ParticipantTeam
  : never);

export type IParticipantToPlayer =
  ParticipantToPlayer<ParticipantType.Individual>;

export type TParticipantToPlayer = ParticipantToPlayer<ParticipantType.Team>;
