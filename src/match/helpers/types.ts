export type MatchTree = {
  number: number;
  type: 'basic' | 'round1' | 'child';
  round: number;
};

export type MatchIdentifier = {
  identifier: number;
  round: number;
  type?: 'basic' | 'round1' | 'child';
  number?: number;
};

export type MatchTreeWinner = {
  number: number;
  round: number;
};

export type MatchChild = {
  identifier: number;
  round: number;
  player1PrevIdentifier: number | null;
  player2PrevIdentifier: number | null;
};

export interface MatchSingleElimination extends MatchChild {
  isBye?: boolean | null;
}
