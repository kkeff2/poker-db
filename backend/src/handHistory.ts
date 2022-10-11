import fs from "fs";
import path from "path";
import { config, getHandInfo, PlayerHand } from "./config";

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

const initPlayerTotal: PlayerStats = {
  totalHands: 0,
  flop: 0,
  turn: 0,
  river: 0,
};

const addToPlayerTotal = (
  currentStats: PlayerStats,
  player: PlayerHand
): PlayerStats => {
  return {
    totalHands: currentStats.totalHands + 1,
    flop: currentStats.flop + (player.actions.flop.length > 0 ? 1 : 0),
    turn: currentStats.turn + (player.actions.turn.length > 0 ? 1 : 0),
    river: currentStats.river + (player.actions.river.length > 0 ? 1 : 0),
  };
};

type PlayerStats = {
  totalHands: number;
  flop: number;
  turn: number;
  river: number;
};

const pollNewFiles = () => {
  const files = fs.readdirSync(config.pathToHandHistoryLogs);
  for (var i = 0; i < files.length; i++) {
    // console.log("files[i]", files[i]);
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
          players[player.name] = addToPlayerTotal(players[player.name], player);
        })
      );

      console.log(players);
      // const test = {};
      // playerHands.forEach((p) => test[p[0]]);
      // console.log({ playerHands });

      // const player = hands.reduce<{ string: Player }>(
      //   (previousValue, currentValue) => previousValue + currentValue,
      //   {
      //     []
      //     totalHands: 0,
      //     safe: 0,
      //   }
      // );

      // const test =hands.map()

      // console.log({ hands }, hands[0].players);
    });
  }
};
