import fs from "fs";
import path from "path";
import { ACTIONS, ROUNDS, config } from "./constants";
import {
  getHandHistories,
  updateHandHistory,
  updatePlayerStats,
} from "./database/integration";
import { getHandInfo } from "./hand";
import {
  Action,
  Hand,
  PlayerHand,
  PlayerId,
  PlayerStats,
  Round,
  RoundStats,
  GameStats,
} from "./types";

let poll: NodeJS.Timeout;

const setPolling = () => {
  poll = setTimeout(() => {
    pollNewFiles();
    // setPolling();
  }, 1000);
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
    const fullPath = path.join(config.pathToHandHistoryLogs, files[i]);
    const filename = files[i];
    console.log("files[i];v", files[i]);
    // TODO: IS FILE MARKED AS DONE?
    fs.readFile(fullPath, "utf8", async (err, data) => {
      if (err) throw err;
      // TODO: IS FILE UPDATED AT RELEVANT?
      const handHistory = await getHandHistories(filename);

      console.log("handHistory", handHistory);
      const rawHands = data.split("\n\n\n\n");
      const rawCompleteHands = rawHands.filter(
        (hand) => hand.split("\n").length != 1
      );
      const hands = rawCompleteHands.map((hand) => getHandInfo(hand));
      const lastHand = hands.reverse()[0];

      console.log(handHistory?.last_hand_id_added);
      console.log(lastHand.handId);
      if (handHistory?.last_hand_id_added === lastHand.handId) {
        return;
      }

      console.log("WHERE", filename);
      const players: Record<PlayerId, PlayerStats> =
        getStatsAggregatedOnPlayers(hands);

      await updatePlayerStats(players);
      await updateHandHistory(filename, lastHand);

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
  console.log({ players });
  // console.log(s
  //   Object.values(players).forEach((a) => console.log(a.NLHE_TOURNAMENT))
  // );
  return players;
};

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
