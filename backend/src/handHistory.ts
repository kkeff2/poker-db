import fs from "fs";
import path from "path";
import { Action, config, getHandInfo, Hand, PlayerHand, Round } from "./config";

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

const initPlayerTotal: PlayerStats = {
  PRE_FLOP: {
    aggression: 0,
    perAction: {
      BET: 0,
      CALL: 0,
      CHECK: 0,
      FOLD: 0,
      RAISE: 0,
      RE_RAISE: 0,
    },
    seen: 0,
  },
  FLOP: {
    aggression: 0,
    perAction: {
      BET: 0,
      CALL: 0,
      CHECK: 0,
      FOLD: 0,
      RAISE: 0,
      RE_RAISE: 0,
    },
    seen: 0,
  },
  TURN: {
    aggression: 0,
    perAction: {
      BET: 0,
      CALL: 0,
      CHECK: 0,
      FOLD: 0,
      RAISE: 0,
      RE_RAISE: 0,
    },
    seen: 0,
  },
  RIVER: {
    aggression: 0,
    perAction: {
      BET: 0,
      CALL: 0,
      CHECK: 0,
      FOLD: 0,
      RAISE: 0,
      RE_RAISE: 0,
    },
    seen: 0,
  },
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

const ROUNDS: Round[] = ["FLOP", "PRE_FLOP", "RIVER", "TURN"];
const ACTIONS: Action[] = ["FOLD", "CALL", "RAISE", "CHECK", "BET", "RE_RAISE"];

const addToPlayerTotal = ({
  currentStats,
  playerHandActions,
  hand,
}: {
  currentStats: PlayerStats;
  playerHandActions: PlayerHand["actions"];
  hand: Hand;
}): PlayerStats => {
  return ROUNDS.reduce<PlayerStats>(
    (previousValue: PlayerStats, round: Round) => {
      if (playerHandActions[round].length > 0) {
        console.log(previousValue);
        return {
          ...previousValue,
          [round]: {
            seen: currentStats[round].seen + 1,
            // TODO: Calculate aggression to include bet and to add to total
            // TODO: Add percentage of seen
            aggression: getActionTypesCount({
              playerRoundActions: playerHandActions[round],
              // TODO: RERAISE
              actionsToCount: ["RAISE", "BET"],
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
    },
    {} as PlayerStats
  );
};

type RoundStats = {
  seen: number;
  aggression: number;
  perAction: Record<Action, number>;
};

type PlayerStats = Record<Round, RoundStats>;

const pollNewFiles = () => {
  const files = fs.readdirSync(config.pathToHandHistoryLogs);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(config.pathToHandHistoryLogs, files[i]);

    fs.readFile(filename, "utf8", function (err, data) {
      if (err) throw err;
      // console.log("OK: " + filename);
      // console.log(data);
      const rawHands = data.split("\n\n\n\n");
      // console.log("hands.length", hands.length);
      const rawCompleteHands = rawHands.filter(
        (hand) => hand.split("\n").length != 1
      );
      const hands = rawCompleteHands.map((hand) => getHandInfo(hand));
      // const playerHands = hands.map((h) => h.players);
      const players: Record<string, PlayerStats> = {};
      hands.forEach((hand) =>
        hand.players.forEach((player) => {
          if (!players[player.name]) {
            players[player.name] = initPlayerTotal;
          }
          players[player.name] = addToPlayerTotal({
            currentStats: players[player.name],
            playerHandActions: player.actions,
            hand: hand,
          });
        })
      );
      // console.log(players);
    });
  }
};
