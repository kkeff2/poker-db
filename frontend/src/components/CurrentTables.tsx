import { Messages } from "poker-db-shared/types";
import { useEffect } from "react";
import { getMessage, sendMessage, ws } from "../webSocket";

export const CurrentTables = () => {
  useEffect(() => {
    sendMessage({ type: "CURRENT_TABLE_UPDATED" });
    ws.onmessage = (event: MessageEvent<Messages>) => {
      const message = getMessage(event);
      if (message.type === "CURRENT_TABLE_UPDATED") {
        // Do shit with state
      }
    };
  }, []);
  return <div>CurrentTables</div>;
};
