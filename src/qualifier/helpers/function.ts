export interface MatchData {
  score: number;
  osuId: number;
  beatmapInfo: {
    beatmapsetId: number;
    id: number;
  };
}
export function getParticipantsScore(
  events: any[],
  isTeam: boolean,
): MatchData[][] {
  const res: MatchData[] = [];
  // if (isTeam) {
  //   events.forEach((lobby) => {
  //     if (lobby.game) {
  //       for (const score of lobby.game.scores) {
  //         if (score.match.team === 'none') {
  //           continue;
  //         }
  //         const newScore = res.find(
  //           (v) =>
  //             v.match === score.match.team &&
  //             v.beatmapInfo.beatmapsetId === lobby.game.beatmap.beatmapset_id &&
  //             v.beatmapInfo.id === lobby.game.beatmap.id,
  //         );
  //         if (newScore) {
  //           newScore.score += score.score;
  //           continue;
  //         }
  //         res.push({
  //           match: score.match.team,
  //           score: score.score,
  //           beatmapInfo: {
  //             beatmapsetId: lobby.game.beatmap.beatmapset_id,
  //             id: lobby.game.beatmap.id,
  //           },
  //         });
  //       }
  //     }
  //   });
  //   return [res];
  // }
  events.forEach((lobby) => {
    if (lobby.game) {
      lobby.game.scores.forEach((score) => {
        res.push({
          score: score.score,
          osuId: score.user_id,
          beatmapInfo: {
            beatmapsetId: lobby.game.beatmap.beatmapset_id, // first id beatmap
            id: lobby.game.beatmap.id, // second id beatmap
          },
        });
      });
    }
  });
  const [...chunked] = groupByToMap(res, (res) => res.beatmapInfo.id).values();
  sortByScore(chunked);
  return chunked;
}

const groupByToMap = <T, Q>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => Q,
) =>
  array.reduce((map, value, index, array) => {
    const key = predicate(value, index, array);
    map.get(key)?.push(value) ?? map.set(key, [value]);
    return map;
  }, new Map<Q, T[]>());

function sortByScore(arr: MatchData[][]) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].sort((a, b) => b.score - a.score);
  }
  return arr;
}
