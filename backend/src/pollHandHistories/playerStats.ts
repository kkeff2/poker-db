import {
  PerAction,
  Action,
  GameStats,
  Round,
  RoundStats,
  PokerStats,
  GameId,
  PlayerId,
  PlayerStats,
  Hand,
  PlayerHand,
} from "poker-db-shared/types";
import { ACTIONS, config, ROUNDS } from "../constants";
import { getPlayerStats } from "../database/integration";

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
    const roundStats: RoundStats = {
      seen: currentStats[round].seen + newStats[round].seen,
      aggression: currentStats[round].aggression + newStats[round].aggression,
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
      let currentStats = await getPlayerStats([playerId]);
      const statsToSave = currentStats.length
        ? addStats(currentStats[0].data, stats)
        : stats;
      return [playerId, JSON.stringify(statsToSave)];
    })
  );
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
  currentRoundStats: RoundStats;
  hand?: Hand;
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

      return {
        ...previousValue,
        [round]: {
          seen: currentStats[round].seen + 1,
          aggression: currentStats[round].aggression + roundAggression,
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
