import { Messages, MessagesWithoutResponse } from "poker-db-shared/types";
import type { RawData, WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { Context } from "../context";

const wss = new WebSocketServer({ port: 8080 });
let connection: WebSocket;

const con = () => {
  if (!connection) {
    throw Error("No websocket connection");
  }
  return connection;
};

export const initWebSocket = (): Promise<void> => {
  return new Promise((resolve) => {
    wss.on("connection", (ws) => {
      connection = ws;
      resolve();
    });
  });
};

export const getMessage = (data: RawData): MessagesWithoutResponse => {
  let parsedData;
  try {
    parsedData = JSON.parse(data.toString());
  } catch (e) {
    console.error(e);
  }
  return parsedData as MessagesWithoutResponse;
};

export const startListeningToMessages = async (context: Context) => {
  con().on("message", (data) => {
    if (!data) {
      throw Error("No message");
    }
    const message = getMessage(data);
    console.log({ message });

    switch (message.type) {
      case "CURRENT_TABLE_UPDATED": {
        context.setSendCurrentTables(true);
      }
    }
    // const playerStats = await getAllPlayerStats();
    // ws.send(JSON.stringify({ type: "ALL_PLAYER_STATS", data: playerStats }));
  });
};

export const sendMessage = (message: Messages) => {
  con().send(JSON.stringify(message));
};
