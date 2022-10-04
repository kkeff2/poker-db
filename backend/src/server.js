import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

console.log("started");

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
});
