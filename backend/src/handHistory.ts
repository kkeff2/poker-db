import fs from "fs";
import path from "path";
import { config, getHandId, getHandInfo } from "./config";

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

const pollNewFiles = () => {
  const files = fs.readdirSync(config.pathToHandHistoryLogs);
  for (var i = 0; i < files.length; i++) {
    // console.log("files[i]", files[i]);
    var filename = path.join(config.pathToHandHistoryLogs, files[i]);

    fs.readFile(filename, "utf8", function (err, data) {
      if (err) throw err;
      // console.log("OK: " + filename);
      // console.log(data);
      const hands = data.split("\n\n\n");
      console.log("hands.length", hands.length);
      const firstHand = hands[0];
      console.log("handID", getHandInfo(firstHand));
      // console.log("handID", getHandId(firstHand));
      // firstHand.
    });
  }
};
