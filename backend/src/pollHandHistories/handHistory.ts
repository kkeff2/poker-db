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
import { ACTIONS, config, ROUNDS } from "../constants";
import { Context } from "../context";
import { con } from "../database/init";
import {
  getAllPlayerStats,
  getHandHistories as getHandHistory,
  getPlayerStats,
  updatePlayerStats,
} from "../database/integration";
import { parseHand } from "../hand";
import { sendMessage } from "../webSocket.ts/ws";

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

const getHands = (fileData: string) => {
  const rawHands = fileData.split("\n\n\n\n");
  const rawHandsList = rawHands.filter((hand) => hand.split("\n").length != 1);
  return rawHandsList.map((rawHand) => parseHand(rawHand));
};

const handleDatabaseUpdate = async ({
  fileName,
  lastHand,
  hands,
}: {
  fileName: string;
  lastHand: Hand;
  hands: Hand[];
}) => {
  const handHistory = await getHandHistory(fileName);
  const skipDbUpdate = handHistory?.last_hand_id_added === lastHand.handId;

  if (!skipDbUpdate) {
    const players: Record<PlayerId, PlayerStats> =
      getStatsAggregatedOnPlayers(hands);

    await updatePlayerStats({
      players,
      handHistory: { fileName, lastHand },
    });
  }
};

export const handleFile = ({
  fileData,
  fileName,
  context,
}: {
  fileData: string;
  fileName: string;
  context: Context;
}) => {
  return new Promise<boolean>(async (resolve) => {
    const hands = getHands(fileData);
    const lastHand = hands[hands.length - 1];
    const contextTable = context.getActiveTable(fileName);

    if (lastHand.handId === contextTable.lastHand?.handId) {
      // Everything in this hand history has been updated
      resolve(false);
    }

    await handleDatabaseUpdate({ lastHand, hands, fileName });
    context.setActiveTable({ id: fileName, lastHand });
    resolve(true);
  });
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
