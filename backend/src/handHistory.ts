import fs from "fs";
import path from "path";
import {
  Action,
  GameStats,
  Hand,
  Messages,
  PlayerHand,
  PlayerId,
  PlayerStats,
  Round,
  RoundStats,
} from "poker-db-shared/types";
import { ACTIONS, config, ROUNDS } from "./constants";
import { Context } from "./context";
import {
  getAllPlayerStats,
  getHandHistories,
  getPlayerStats,
  updatePlayerStats,
} from "./database/integration";
import { getHandInfo } from "./hand";
import { sendMessage } from "./webSocket.ts/ws";

const setPolling = (context: Context) => {
  // console.log("sendCurrentTables", context.sendCurrentTables);

  setTimeout(() => {
    // if (context.sendCurrentTables) {
    //   sendMessage({type: 'CURRENT_TABLE_UPDATED', })
    // }
    pollNewFiles(context);
    setPolling(context);
  }, 5000);
};

export const initHandHistoryPoll = (context: Context) => {
  setPolling(context);
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

const handleFile = ({
  fullPath,
  filename,
  context,
}: {
  fullPath: string;
  filename: string;
  context: Context;
}) => {
  return new Promise<void>((resolve, reject) => {
    fs.readFile(fullPath, "utf8", async (err, data) => {
      if (err) {
        reject(err);
      }

      // TODO: IS FILE UPDATED AT RELEVANT?

      const rawHands = data.split("\n\n\n\n");
      const rawCompleteHands = rawHands.filter(
        (hand) => hand.split("\n").length != 1
      );
      const hands = rawCompleteHands.map((hand) => getHandInfo(hand));
      const lastHand = hands.reverse()[0];

      const skipDbUpdate = await isDatabaseAlreadyUpdated(filename, lastHand);

      if (!skipDbUpdate) {
        const players: Record<PlayerId, PlayerStats> =
          getStatsAggregatedOnPlayers(hands);

        await updatePlayerStats({
          players,
          handHistory: { filename, lastHand },
        });
      }

      if (
        context.sendCurrentTables &&
        context.activeTables.includes(filename)
      ) {
        const tablePlayerIds = lastHand.players.map((p) => p.id);
        const playerStats = await getPlayerStats(tablePlayerIds);
        console.log({ playerStats });
        const message: Messages = {
          type: "CURRENT_TABLE_UPDATED",
          response: {
            hand: lastHand,
            playerStats: playerStats.map((ps) => {
              console.log("PS", ps);
              const stats = ps.data[lastHand.gameId];
              if (!stats) {
                throw Error("Stats could not be found on user");
              }
              return {
                playerId: ps.player_id,
                stats,
              };
            }),
          },
        };
        sendMessage(message);
      }

      resolve();

      // TODO Update BD HERE with players
    });
  });
};

const pollNewFiles = async (context: Context) => {
  const files = fs.readdirSync(config.pathToHandHistoryLogs);
  for (var i = 0; i < files.length; i++) {
    const fullPath = path.join(config.pathToHandHistoryLogs, files[i]);
    const filename = files[i];
    await handleFile({ fullPath, filename, context });
    // TODO: IS FILE MARKED AS DONE?
  }
};

const isDatabaseAlreadyUpdated = async (filename: string, lastHand: Hand) => {
  const handHistory = await getHandHistories(filename);
  return handHistory?.last_hand_id_added === lastHand.handId;
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
