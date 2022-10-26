import fs from "fs";
import path from "path";
import { Action, config, getHandInfo, PlayerHand, Round } from "./config";

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
    },
    seen: 0,
  },
};

const getActionTypesCount = (actions: Action[], action: Action) => {
  return actions.filter((a) => a == action).length;
};

const getUpdatedStats = (
  roundAction: Action[],
  currentStats: RoundStats
): RoundStats["perAction"] => {
  return ACTIONS.reduce<RoundStats["perAction"]>(
    (previousValue: RoundStats["perAction"], action: Action) => {
      return {
        ...previousValue,
        [action]:
          getActionTypesCount(roundAction, action) +
          currentStats.perAction[action],
      };
    },
    {} as RoundStats["perAction"]
  );
};

const ROUNDS: Round[] = ["FLOP", "PRE_FLOP", "RIVER", "TURN"];
const ACTIONS: Action[] = ["FOLD", "CALL", "RAISE", "CHECK", "BET"];

const addToPlayerTotal = (
  currentStats: PlayerStats,
  currentActions: PlayerHand["actions"]
): PlayerStats => {
  return ROUNDS.reduce<PlayerStats>(
    (previousValue: PlayerStats, round: Round) => {
      if (currentActions[round].length > 0) {
        return {
          ...previousValue,
          [round]: {
            seen: currentStats[round].seen + 1,
            // TODO: Calculate aggression to include bet and to add to total
            // TODO: Add percentage of seen
            aggression: getActionTypesCount(currentActions[round], "RAISE"),
            perAction: getUpdatedStats(
              currentActions[round],
              currentStats[round]
            ),
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
      const playerHands = hands.map((h) => h.players);
      const players: Record<string, PlayerStats> = {};
      playerHands.forEach((hand) =>
        hand.forEach((player) => {
          if (!players[player.name]) {
            players[player.name] = initPlayerTotal;
          }
          players[player.name] = addToPlayerTotal(
            players[player.name],
            player.actions
          );
        })
      );
      console.log(players);
    });
  }
};
