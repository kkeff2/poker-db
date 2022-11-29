import { Context } from "./context";
import { initDb } from "./database/init";
import { initHandHistoryPoll } from "./handHistory";
import { initWebSocket, startListeningToMessages } from "./webSocket.ts/ws";

const context = new Context();

initWebSocket().then(() => {
  initDb();
  initHandHistoryPoll(context);
  startListeningToMessages(context);
});
