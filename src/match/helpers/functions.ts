import { Tournament } from 'src/tournament/entities/tournament/tournament.entity';
import { MatchChild, MatchIdentifier, MatchTree } from './types';

export function getSeeding(numPlayers: number): number[] {
  const rounds: number = Math.log(numPlayers) / Math.log(2) - 1;
  let seeding: number[] = [1, 2];
  for (let i = 0; i < rounds; i++) {
    const out: number[] = [];
    const length: number = seeding.length * 2 + 1;
    seeding.forEach(function (d: number) {
      out.push(d);
      out.push(length - d);
    });
    const removeNumSuperior: number[] = out.filter(
      (num: number) => num <= numPlayers,
    ); // remove num superior
    seeding = removeNumSuperior;
  }
  return seeding;
}

export function getLengthTreeLoserBracket(
  matchesByRound: number[],
  numPlayers: number,
): number {
  return numPlayers === 64
    ? matchesByRound.length + 2
    : matchesByRound.length + 1;
}

export function matchesByRound(numPlayers: number) {
  let matchesByRound: number[] = [];
  for (let i = 1; i < numPlayers; i *= 2) {
    if (numPlayers < i * 2) {
      matchesByRound.push(numPlayers - i); //adding or deleting matches
    } else {
      matchesByRound.push(i); //print matches 1, 2, 4, 8, 16, 32, etc...
    }
  }
  return matchesByRound.reverse(); // bracket in order
}

export function getRounds(numbersPlayers: number) {
  if (!numbersPlayers) return undefined;
  let incrementations = 0;
  let res: number[] = [];
  for (let i = 1; i < numbersPlayers; i *= 2) {
    res.push((incrementations += 1));
  }
  res.push((incrementations += 1));
  return res;
}

export function getParentIdentifier(
  numPlayers: number,
  currentMatch: number,
): number | null {
  const semiFinal = isFinal(numPlayers, currentMatch);
  return numPlayers - 1 === currentMatch
    ? null
    : !powerOf2(numPlayers) && !semiFinal
    ? Math.ceil(numPlayers / 2) + Math.floor(currentMatch / 2)
    : semiFinal
    ? numPlayers - 1
    : numPlayers / 2 + Math.ceil(currentMatch / 2);
}
export function getParentIdentifiersLoserBracket(
  numPlayers: number,
  currentMatch: number,
  numberOfMatches: number,
): { winnerPointer: number | null; loserPointer: number | null } | null {
  const semiFinal = isFinal(numPlayers, currentMatch);
  return numPlayers - 1 === currentMatch
    ? null
    : !powerOf2(numPlayers) && !semiFinal
    ? {
        winnerPointer:
          Math.ceil(numPlayers / 2) +
          Math.floor(currentMatch / 2) +
          Math.floor(numberOfMatches / 2),
        loserPointer: Math.ceil(numPlayers / 2) + Math.floor(currentMatch / 2),
      }
    : semiFinal
    ? {
        winnerPointer: numPlayers - 1 + Math.floor(numberOfMatches / 2),
        loserPointer: numPlayers - 1,
      }
    : {
        loserPointer: numPlayers / 2 + Math.ceil(currentMatch / 2),
        winnerPointer:
          numPlayers / 2 +
          Math.ceil(currentMatch / 2) +
          Math.floor(numberOfMatches / 2),
      };
}
export function powerOf2(v: number): boolean {
  return v && !(v & (v - 1));
}

export function isFinal(n: number, c: number): boolean {
  n = n - 1;
  return c === n - 1 || c === n - 2;
}

export function shuffleArray<T = unknown>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex: number;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function getIdentifiersLosersMatches(
  branches: MatchTree[],
): MatchIdentifier[] {
  const loserIdentifiers: MatchIdentifier[] = [];
  let identifier = 1;
  branches.forEach((branch) => {
    if (branch.type === 'round1') {
      for (let i = 1; i <= branch.number * 2; i++) identifier++;
      for (let i = 1; i <= branch.number; i++)
        loserIdentifiers.push({
          ...branch,
          identifier: identifier++,
        });
    }

    if (branch.type === 'basic') {
      for (let i = 1; i <= branch.number; i++) identifier++;
      for (let i = 1; i <= branch.number; i++)
        loserIdentifiers.push({
          ...branch,
          identifier: identifier++,
        });
    }

    if (branch.type === 'child')
      for (let i = 1; i <= branch.number; i++)
        loserIdentifiers.push({
          ...branch,
          identifier: identifier++,
        });
  });
  return loserIdentifiers; // log [1, 2, 3, 4, 7, 8, ect...]
}

export function getIdentifiersWinnersMatches(
  branches: MatchIdentifier[],
  numPlayers: Tournament['numbersPlayers'],
): MatchIdentifier[] {
  const matchesWinners = matchesByRound(numPlayers); // rounds
  matchesWinners.push(2);
  const losersIdentifiers = branches.map((t) => t.identifier); // identifiers
  let arr = [];
  const height = numPlayers * 2 - 1;
  for (let i = 1; i <= height; i++) {
    arr.push(i);
  }
  arr = arr.filter((item) => !losersIdentifiers.includes(item));
  const res: MatchIdentifier[] = [];
  let round = 0;
  matchesWinners.forEach((numberMatches) => {
    round++;
    for (let i = 1; i <= numberMatches; i++)
      res.push({ round, identifier: arr.shift() });
  });
  return res;
}

export function getLoserMatches(
  matchesWinners: number[],
  length: number,
): MatchTree[] {
  const treeMatches: MatchTree[] = [];
  let round = 0;
  do {
    round++;
    let numberOfMatches = matchesWinners.shift();

    if (round === 1) {
      const round1Condition = Math.floor(numberOfMatches / 2);
      for (let i = 1; i <= round1Condition; i++) {
        if (i === round1Condition)
          treeMatches.push({ number: i, type: 'round1', round: -round });
      }
    } else if (matchesWinners.length > 0) {
      let c = 0;
      // dont print matches where we already create before
      for (let i = 1; i <= numberOfMatches; i++) {
        c = i;
        if (i === numberOfMatches)
          treeMatches.push({ number: i, type: 'basic', round: -round });
      }
      // child of loser bracket matches
      if (matchesWinners.length > 1) {
        const childCondition = Math.floor(c / 2);
        for (let i = 1; i <= childCondition; i++) {
          let n = -round;
          if (i === childCondition)
            treeMatches.push({ number: i, type: 'child', round: n - 1 });
        }
      }
      round++;
    }
  } while (round <= length);
  return treeMatches;
}

export function getChildIdentifiers(
  matchIdentifierWinner: MatchIdentifier[],
  matchIdentifierLoser: MatchIdentifier[],
  numPlayers: number,
): MatchChild[] {
  const matchesWinners = matchesByRound(numPlayers); // rounds
  matchesWinners.push(2);
  const length = matchesWinners.length;

  const res: MatchChild[] = [];
  const arrLoser: MatchIdentifier[] = [];
  const arrWinner: MatchIdentifier[] = [];
  const arrWinnerInLoserTree: number[] = [];
  const lowestRound = Math.min(
    ...matchIdentifierLoser.map((match) => match.round),
  );
  for (let round = 1; round <= length; round++) {
    let numberOfMatches = matchesWinners.shift();
    let payload;
    // why reverse ?
    if (round === length && round % 2 === 0) arrWinnerInLoserTree.reverse();
    for (let y = 0; y < numberOfMatches; y++) {
      let shifted = matchIdentifierWinner.shift();
      arrLoser.push(shifted);
      arrWinner.push(shifted);
      payload = {
        identifier: shifted.identifier,
        round: shifted.round,
      };

      if (round !== 1 && round !== length) {
        payload.player1PrevIdentifier = arrWinner.shift().identifier;
        payload.player2PrevIdentifier = arrWinner.shift().identifier;
      }

      if (round >= length) {
        if (y === 0)
          matchIdentifierLoser.forEach((matchLoser) => {
            if (-matchLoser.round >= round) {
              arrWinnerInLoserTree.push(matchLoser.identifier);
              const c = {
                identifier: matchLoser.identifier,
                round: matchLoser.round,
              };
              const payload = Object.assign(c, {
                player1PrevIdentifier:
                  matchLoser.type === 'child'
                    ? arrWinnerInLoserTree.shift()
                    : arrLoser.shift().identifier,
                player2PrevIdentifier: arrWinnerInLoserTree.shift(),
              });
              res.push(payload);
            }
          });

        let winnerShifted = arrWinner.shift().identifier;
        payload.player1PrevIdentifier = winnerShifted;
        payload.player2PrevIdentifier =
          y === 0 ? arrWinnerInLoserTree.shift() : winnerShifted;
      }
      res.push(payload);
      if (y !== 0 && round === length) return res;
    }
    let x = 0;
    let z = 0;
    matchIdentifierLoser.forEach((matchLoser) => {
      if (-matchLoser.round === round) {
        const c = {
          identifier: matchLoser.identifier,
          round: matchLoser.round,
        };
        if (matchLoser.round === -1) {
          const payload = Object.assign(c, {
            player1PrevIdentifier: arrLoser.shift().identifier,
            player2PrevIdentifier: arrLoser.shift().identifier,
          });
          res.push(payload);
        } else {
          const payload: MatchChild = Object.assign(c, {
            player1PrevIdentifier:
              matchLoser.type === 'child'
                ? arrWinnerInLoserTree.shift()
                : arrLoser.shift().identifier,
            player2PrevIdentifier: null,
          });
          let p2: MatchChild['player2PrevIdentifier'];
          if (
            lowestRound <= -7 &&
            !x &&
            matchesToShuffle(matchIdentifierLoser, 'max')[0].round &&
            matchLoser.round ===
              matchesToShuffle(matchIdentifierLoser, 'max')[0].round
          ) {
            const l = matchesToShuffle(matchIdentifierLoser, 'max').length;
            const output = shuffleMatches(
              arrWinnerInLoserTree.slice(0, l).reverse(),
            );
            output.forEach((element) => {
              arrWinnerInLoserTree.shift();
              arrWinnerInLoserTree.push(element);
            });
            p2 = arrWinnerInLoserTree.shift();
            x++;
          } else if (
            !z &&
            lowestRound <= -9 &&
            matchesToShuffle(matchIdentifierLoser, 'min')[0].round &&
            matchLoser.round ===
              matchesToShuffle(matchIdentifierLoser, 'min')[0].round
          ) {
            const l = matchesToShuffle(matchIdentifierLoser, 'min').length;
            const output = arrWinnerInLoserTree.slice(0, l).reverse();

            output.forEach((element) => {
              arrWinnerInLoserTree.shift();
              arrWinnerInLoserTree.push(element);
            });
            p2 = arrWinnerInLoserTree.shift();
            z++;
          } else {
            p2 = arrWinnerInLoserTree.shift();
          }
          payload.player2PrevIdentifier = p2;
          res.push(payload);
        }
        arrWinnerInLoserTree.push(matchLoser.identifier);
      }
    });
  }
  return res;
}

export function shuffleMatches<T>(matches: T[]): T[] {
  const matchShuffled = chunkArray(matches, 2);
  matchShuffled.forEach((titi) => titi.reverse());
  return [].concat(...matchShuffled);
}

export function matchesToShuffle(
  toShuffle: MatchIdentifier[],
  minOrMax: 'max' | 'min',
) {
  const matches = toShuffle.filter(
    (match) =>
      match.type === 'basic' &&
      -match.round % 2 === 0 &&
      match.round !== -2 &&
      match.number > 2,
  );
  return minOrMax === 'max'
    ? matches.filter(
        (match) => match.round === Math.max(...matches.map((o) => o.round)),
      )
    : matches.filter(
        (match) => match.round === Math.min(...matches.map((o) => o.round)),
      );
}

export function chunkArray<T>(arr: T[], n: number): T[][] {
  const chunkLength = Math.max(arr.length / n, 1);
  const chunks = [];
  for (let i = 0; i < n; i++) {
    if (chunkLength * (i + 1) <= arr.length)
      chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
  }
  return chunks;
}
