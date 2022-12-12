import { Context } from "./context";
import { initDb } from "./database/init";
import {
  initHandHistoryPoll,
  pollHandHistories,
} from "./pollHandHistories/polling";
import { initWebSocket, startListeningToMessages } from "./webSocket.ts/ws";

const context = new Context();

const run = async () => {
  await initDb();
  await context.setHandHistories();
  await pollHandHistories(context.handHistories);

  initWebSocket(context).then(async () => {
    await initHandHistoryPoll(context);
    startListeningToMessages(context);
  });
};

run();
