import { Messages } from "poker-db-shared/types";

export const ws = new WebSocket("ws://localhost:8080");

export const sendMessage = (eventMessage: Pick<Messages, "type">) => {
  ws.send(JSON.stringify(eventMessage));
};

export const getMessage = (event: MessageEvent<Messages>) => {
  let message: Messages;
  try {
    message = JSON.parse(event.data.toString());
  } catch (e) {
    throw Error("Message could not be parsed");
  }
  return message;
};
