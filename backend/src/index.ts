import { WebSocketServer } from "ws";
import { initDb } from "./database";
import { initHandHistoryPoll } from "./handHistory";

const wss = new WebSocketServer({ port: 8080 });
initHandHistoryPoll();

wss.on("connection", function connection(ws) {
  initDb();
  initHandHistoryPoll();

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
