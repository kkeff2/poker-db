import fs from "fs";
import path from "path";
import { ACTIONS, ROUNDS, config } from "./constants";
import { getHandInfo } from "./hand";
import {
  Action,
  Hand,
  PlayerHand,
  PlayerId,
  PlayerStats,
  Round,
  RoundStats,
  PokerType,
  GameForm,
  PokerStats,
  GameId,
  GameStats,
} from "./types";

let poll: NodeJS.Timeout;

const setPolling = () => {
  pollNewFiles();
  poll = setTimeout(() => {
    setPolling();
  }, 100000000);
};

export const initHandHistoryPoll = () => {
  setPolling();
};

const handHistoryLogFinished = () => {
  // If this is a tournament
  // Check
  return false;
};

const getActionTypesCount = ({
  playerRoundActions,
  actionsToCount,
}: {
  playerRoundActions: Action[];
  actionsToCount: Action[];
}) => {
  return playerRoundActions.filter((a) => actionsToCount.includes(a)).length;
};

const getUpdatedActions = ({
  playerRoundActions,
  currentRoundStats,
}: {
  playerRoundActions: Action[];
  currentRoundStats: RoundStats;
  hand: Hand;
}): RoundStats["perAction"] => {
  return ACTIONS.reduce<RoundStats["perAction"]>(
    (previousValue: RoundStats["perAction"], action: Action) => {
      return {
        ...previousValue,
        [action]:
          getActionTypesCount({
            playerRoundActions,
            actionsToCount: [action],
          }) + currentRoundStats.perAction[action],
      };
    },
    {} as RoundStats["perAction"]
  );
};

const getUpdatedGameStats = ({
  currentStats = initGameStats,
  playerHandActions,
  hand,
}: {
  currentStats?: GameStats;
  playerHandActions: PlayerHand["actions"];
  hand: Hand;
}): GameStats => {
  return ROUNDS.reduce((previousValue: GameStats, round: Round) => {
    if (playerHandActions[round].length > 0) {
      return {
        ...previousValue,
        [round]: {
          seen: currentStats[round].seen + 1,
          aggression: getActionTypesCount({
            playerRoundActions: playerHandActions[round],
            actionsToCount: ["RAISE", "BET", "RE_RAISE"],
          }),
          perAction: getUpdatedActions({
            playerRoundActions: playerHandActions[round],
            currentRoundStats: currentStats[round],
            hand,
          }),
        },
      };
    } else {
      return {
        ...previousValue,
        [round]: currentStats[round],
      };
    }
  }, {} as GameStats);
};

const pollNewFiles = () => {
  const files = fs.readdirSync(config.pathToHandHistoryLogs);
  for (var i = 0; i < files.length; i++) {
    const filename = path.join(config.pathToHandHistoryLogs, files[i]);
    // TODO: IS FILE MARKED AS DONE?
    fs.readFile(filename, "utf8", function (err, data) {
      if (err) throw err;
      // TODO: IS FILE UPDATED AT RELEVANT?
      const rawHands = data.split("\n\n\n\n");
      console.log("TODO: Check if last hand is complete");
      const rawCompleteHands = rawHands.filter(
        (hand) => hand.split("\n").length != 1
      );
      const hands = rawCompleteHands.map((hand) => getHandInfo(hand));

      const players: Record<PlayerId, PlayerStats> =
        getStatsAggregatedOnPlayers(hands);

      for (const p in players) {
        for (const game in players[p]) {
          // console.log(`${p} :::::::`, players[p][game]);
        }
      }
      // TODO Update BD HERE with players
    });
  }
};

export const getStatsAggregatedOnPlayers = (
  hands: Hand[]
): Record<PlayerId, PlayerStats> => {
  const players: Record<PlayerId, PlayerStats> = {};
  hands.forEach((hand) => {
    hand.players.forEach((player) => {
      if (!players[player.id]) {
        players[player.id] = {};
      }
      players[player.id][hand.gameId] = getUpdatedGameStats({
        currentStats: players[player.id][hand.gameId],
        playerHandActions: player.actions,
        hand: hand,
      });
    });
  });
  // console.log({ players });
  // console.log(
  //   Object.values(players).forEach((a) => console.log(a.NLHE_TOURNAMENT))
  // );
  return players;
};

// export const getPlayerHandStats = ()

// const initPlayer = (
//   id: PlayerId,
//   hand: Hand
// ): Record<PlayerId, PlayerStats> => {
//   return {
//     [id]: initPokerType(hand),
//   };
// };

// const initPokerType = (
//   hand: Hand
// ): Partial<Record<PokerType, GameFormStats>> => {
//   return {
//     [hand.pokerType]: initGameType(hand),
//   };
// };

// const initGameType = (hand: Hand): Partial<Record<GameForm, GameFormStats>> => {
//   return {
//     [hand.gameForm]: initGameStats,
//   };
// };

const initGameStats: GameStats = ROUNDS.reduce(
  (previousValue: GameStats, round: Round) => {
    return {
      ...previousValue,
      [round]: {
        seen: 0,
        aggression: 0,
        perAction: {
          FOLD: 0,
          CALL: 0,
          RAISE: 0,
          CHECK: 0,
          BET: 0,
          RE_RAISE: 0,
        },
      },
    };
  },
  {} as GameStats
);

// const playerHands = hands.map((h) => h.players);
// struktur per hand
// const players = hands.reduce(
//   (prevPlayerStats: Record<PlayerId, PlayerStats>, hand: Hand) => {
// const playerHands = hand.players.reduce(
//   (
//     prevHandStats: Record<PlayerId, PlayerStats>,
//     playerHand: PlayerHand
//   ) => {
//     return {...prevHandStats, [playerHand.id]: {
//       [hand.pokerType]: {
//         [hand.gameType]: addToPlayerTotal({
//                 currentStats: prevPlayerStats[playerHand.id][hand.pokerType][hand.gameType],
//                 playerHandActions: playerHand.actions,
//                 hand: hand,
//               })
//       }
//     }}
//   },
//   {}
// );
// if (previousValue[])
// hand.players.forEach((p) => {
//   if (!prevPlayerStats[p.id]){

//   }
//   const playerStats = prevPlayerStats[p.id] || initPlayer(p.id, hand);
//   const type1 = playerStats[hand.pokerType];
//   const type2 = initPokerType(hand);

//   const asd1 = type1 ? type1[hand.gameForm] :
//   const tetetete = type2[hand.gameForm];
//   const pokerStats =
//     playerStats[hand.pokerType] || initPokerType(hand);
//   console.log("pokerStats", pokerStats);

// const test = hand.gameForm;
// const gameStats = pokerStats[hand.gameForm] || initGameType(hand);
// console.log(gameStats);
// const currentStats = pokerStats
//   ? pokerStats[hand.gameType]
//   : undefined;
//     });
//     return { ...prevPlayerStats };
//   },
//   {} as Record<PlayerId, PlayerStats>
// );

// const players: Record<PlayerId, PlayerStats> = {};
