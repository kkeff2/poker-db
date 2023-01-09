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

export const initWebSocket = (context: Context): Promise<void> => {
  return new Promise((resolve, reject) => {
    wss.on("connection", (ws) => {
      console.log("ON WSS CONNECTION");
      context.initCurrentTableSetup();
      connection = ws;
      resolve();
    });
    wss.on("error", (error) => {
      console.log("ON WSS ERROR");
      reject(error);
    });
    wss.on("close", () => {
      console.log("ON WSS CLOSE");
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
  con().on("close", () => {
    console.log("Connection: CLOSE");
  });
  con().on("error", (error) => {
    console.log("Connection: ERROR", error);
  });
  con().on("open", () => {
    console.log("Connection: OPEN");
  });
  con().on("message", (data) => {
    if (!data) {
      throw Error("No message");
    }
    const message = getMessage(data);
    console.log({ message });

    switch (message.type) {
      case "CURRENT_TABLE_UPDATED": {
        context.initCurrentTableSetup();
      }
    }
  });
};

export const sendMessage = (message: Messages) => {
  con().send(JSON.stringify(message));
};
