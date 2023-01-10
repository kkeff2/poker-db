import {
  GameStats,
  Hand,
  PerAction,
  PlayerMetrics,
} from "poker-db-shared/types";
import { getPlayerStats } from "../database/integration";
import { initPerAction } from "../pollHandHistories/playerStats";
import { isBestPlayer, removeFileName } from "../utils";

export const getPlayerMetrics = async (
  lastHand: Hand,
  fileName: string
): Promise<{ playerId: string; metrics: PlayerMetrics }[]> => {
  const playerStats = await getPlayerStats(lastHand.players.map((p) => p.id));
  return playerStats.map(({ data, player_id }) => {
    const gameStats = data[lastHand.gameId];
    if (!gameStats) {
      throw Error("Stats could not be found on user");
    }

    const playerId = isBestPlayer(player_id, fileName)
      ? removeFileName(player_id, fileName)
      : player_id;

    return {
      playerId,
      metrics: getMetrics(gameStats, isBestPlayer(player_id, fileName)),
    };
  });
};

function getMetrics(
  gameStats: GameStats,
  isBestPlayer: boolean
): PlayerMetrics {
  const totalHands = gameStats.PRE_FLOP.seen;
  return {
    aggressionFactor: getAggressionFactor(gameStats),
    flopsSeen: getPercentage(gameStats.FLOP.seen / totalHands),
    turnsSeen: getPercentage(gameStats.TURN.seen / totalHands),
    riversSeen: getPercentage(gameStats.RIVER.seen / totalHands),
    isBestPlayer,
    preFlopRaise: getPercentage(gameStats.PRE_FLOP.raiseInRound / totalHands),
    voluntarilyPutMoneyInPot: getPercentage(
      gameStats.PRE_FLOP.voluntarilyPutMoneyInPot / totalHands
    ),
    totalHands,
  };
}

const getPercentage = (decimal: number) => Math.round(decimal * 100) / 100;

function getAggressionFactor(gameStats: GameStats): number | null {
  const { CALL, BET, RAISE, RE_RAISE } = getTotalActions(gameStats);
  const aggressionFactor = (BET + RAISE + RE_RAISE) / CALL;

  if (!isFinite(aggressionFactor)) {
    return null;
  }

  return Math.round(aggressionFactor * 10) / 10;
}

t getTotalActions = (gameStats: GameStats): PerAction => {
  return Object.values(gameStats).reduce((previousValue, currentValue) => {
    return {
      FOLD: previousValue.FOLD + currentValue.perAction.FOLD,
      CALL: previousValue.CALL + currentValue.perAction.CALL,
      RAISE: previousValue.RAISE + currentValue.perAction.RAISE,
      CHECK: previousValue.CHECK + currentValue.perAction.CHECK,
      BET: previousValue.BET + currentValue.perAction.BET,
      RE_RAISE: previousValue.RE_RAISE + currentValue.perAction.RE_RAISE,
    };
  }, initPerAction);
};
