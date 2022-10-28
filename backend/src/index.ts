import { WebSocketServer } from "ws";
import { initDb } from "./database/init";
import { initHandHistoryPoll } from "./handHistory";

const wss = new WebSocketServer({ port: 8080 });
initDb();
initHandHistoryPoll();
wss.on("connection", function connection(ws) {
  initHandHistoryPoll();

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
