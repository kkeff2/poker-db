import { WebSocketServer } from "ws";
import { initDb } from "./database/init";
import { getAllPlayerStats, getPlayerStats } from "./database/integration";
import { initHandHistoryPoll } from "./handHistory";

const wss = new WebSocketServer({ port: 8080 });
initDb();
wss.on("connection", function connection(ws) {
  console.log("ON CONNECTION");
  initHandHistoryPoll();

  ws.on("message", async (data) => {
    console.log("received: %s", data);
    let test;
    try {
      test = JSON.parse(data.toString());
    } catch (e) {
      console.error(e);
    }

    console.log({ test });
    if (test.type === "WEB_SOCKET_CONNECTED") {
      const playerStats = await getAllPlayerStats();
      ws.send(JSON.stringify({ type: "ALL_PLAYER_STATS", data: playerStats }));
    }
  });

  // ws.send("something");
});
