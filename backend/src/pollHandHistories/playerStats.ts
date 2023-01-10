import {
  PerAction,
  Action,
  GameStats,
  Round,
  RoundAction,
  PokerStats,
  GameId,
  PlayerId,
  PlayerStats,
  Hand,
  PlayerHand,
} from "poker-db-shared/types";
import { ACTIONS, config, ROUNDS } from "../constants";
import { getPlayerStats as getPlayerStatsDb } from "../database/integration";

const getUpdateActions = (
  currentActions: PerAction,
  newActions: PerAction
): PerAction => {
  return ACTIONS.reduce((previousValue: PerAction, action: Action) => {
    const newPerAction: Partial<PerAction> = {
      [action]: currentActions[action] + newActions[action],
    };
    return {
      ...previousValue,
      ...newPerAction,
    };
  }, {} as PerAction);
};

const updateGameStats = (currentStats: GameStats, newStats: GameStats) => {
  return ROUNDS.reduce((previousValue: GameStats, round: Round) => {
    const roundStats: RoundAction = {
      seen: currentStats[round].seen + newStats[round].seen,
      aggression: currentStats[round].aggression + newStats[round].aggression,
      raiseInRound:
        currentStats[round].raiseInRound + newStats[round].raiseInRound,
      voluntarilyPutMoneyInPot:
        currentStats[round].voluntarilyPutMoneyInPot +
        newStats[round].voluntarilyPutMoneyInPot,
      perAction: getUpdateActions(
        currentStats[round].perAction,
        newStats[round].perAction
      ),
    };
    return {
      ...previousValue,
      [round]: roundStats,
    };
  }, {} as GameStats);
};

const addStats = (
  currentStats: Partial<PokerStats>,
  newStats: Partial<PokerStats>
): Partial<PokerStats> => {
  const [gameId, newGameStats] = Object.entries(newStats)[0];
  const currentGameStats = currentStats[gameId as GameId];

  return {
    ...currentStats,
    [gameId]: currentGameStats
      ? updateGameStats(currentGameStats, newGameStats)
      : newGameStats,
  };
};

export const playerStatsUpdated = async (
  newPlayerStats: Record<PlayerId, PlayerStats>
) => {
  return await Promise.all(
    Object.entries(newPlayerStats).map(async ([playerId, stats]) => {
      let currentStats = await getPlayerStatsDb([playerId]);
      const statsToSave = currentStats.length
        ? addStats(currentStats[0].data, stats)
        : stats;
      return [playerId, JSON.stringify(statsToSave)];
    })
  );
};

export const initPerAction: PerAction = {
  FOLD: 0,
  CALL: 0,
  RAISE: 0,
  CHECK: 0,
  BET: 0,
  RE_RAISE: 0,
};

const initGameStats: GameStats = ROUNDS.reduce(
  (previousValue: GameStats, round: Round) => {
    const newRoundAction: RoundAction = {
      seen: 0,
      aggression: 0,
      raiseInRound: 0,
      voluntarilyPutMoneyInPot: 0,
      perAction: initPerAction,
    };
    return {
      ...previousValue,
      [round]: newRoundAction,
    };
  },
  {} as GameStats
);

const getActionTypesCount = ({
  playerRoundActions,
  actionsToCount,
}: {
  playerRoundActions: Action[];
  actionsToCount: Action[];
}) => {
  return playerRoundActions.filter((a) => actionsToCount.includes(a)).length;
};

export const getUpdatedActions = ({
  playerRoundActions,
  currentRoundStats,
}: {
  playerRoundActions: Action[];
  currentRoundStats: RoundAction;
  hand?: Hand;
}): RoundAction["perAction"] => {
  return ACTIONS.reduce<RoundAction["perAction"]>(
    (previousValue: RoundAction["perAction"], action: Action) => {
      return {
        ...previousValue,
        [action]:
          getActionTypesCount({
            playerRoundActions,
            actionsToCount: [action],
          }) + currentRoundStats.perAction[action],
      };
    },
    {} as RoundAction["perAction"]
  );
};

const getUpdatedStatsForPlayer = ({
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
      const roundAggression = getActionTypesCount({
        playerRoundActions: playerHandActions[round],
        actionsToCount: ["RAISE", "BET", "RE_RAISE"],
      });

      const raiseInRoundCountUp =
        getActionTypesCount({
          playerRoundActions: playerHandActions[round],
          actionsToCount: ["RAISE", "RE_RAISE"],
        }) > 0
          ? 1
          : 0;

      const voluntarilyPutMoneyInPotCountUp =
        getActionTypesCount({
          playerRoundActions: playerHandActions[round],
          actionsToCount: ["RAISE", "BET", "RE_RAISE", "CALL"],
        }) > 0
          ? 1
          : 0;

      const newValue: GameStats = {
        ...previousValue,
        [round]: {
          seen: currentStats[round].seen + 1,
          raiseInRound: currentStats[round].raiseInRound + raiseInRoundCountUp,
          aggression: currentStats[round].aggression + roundAggression,
          voluntarilyPutMoneyInPot:
            currentStats[round].voluntarilyPutMoneyInPot +
            voluntarilyPutMoneyInPotCountUp,
          perAction: getUpdatedActions({
            playerRoundActions: playerHandActions[round],
            currentRoundStats: currentStats[round],
            hand,
          }),
        },
      };

      return newValue;
    } else {
      return {
        ...previousValue,
        [round]: currentStats[round],
      };
    }
  }, {} as GameStats);
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
      players[player.id][hand.gameId] = getUpdatedStatsForPlayer({
        currentStats: players[player.id][hand.gameId],
        playerHandActions: player.actions,
        hand: hand,
      });
    });
  });
  return players;
};

export const getStatsOnBestPlayer = (hands: Hand[]): PlayerStats => {
  const gameId = hands[0].gameId;
  const gameStats = hands.reduce((prev, currentHand) => {
    const bestPlayer = currentHand.players.find(
      (p) => p.id === config.playerId
    );
    if (!bestPlayer) {
      throw Error(`Best player >>> ${config.playerId} <<< not found in hand`);
    }

    const newStats = getUpdatedStatsForPlayer({
      currentStats: prev,
      playerHandActions: bestPlayer.actions,
      hand: currentHand,
    });
    return newStats;
  }, {} as GameStats);

  return { [gameId]: gameStats };
};
