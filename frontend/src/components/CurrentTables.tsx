import { Typography } from "@mui/material";
import type { Messages, Table } from "poker-db-shared/types";
import { useEffect, useState } from "react";
import { getMessage, sendMessage, ws } from "../webSocket";

export const CurrentTables = () => {
  const [tableStats, setTableStats] = useState<Table[]>();
  useEffect(() => {
    sendMessage({ type: "CURRENT_TABLE_UPDATED" });
    ws.onmessage = (event: MessageEvent<Messages>) => {
      const message = getMessage(event);
      if (message.type === "CURRENT_TABLE_UPDATED") {
        // Do shit with state
        console.log(new Date().toISOString(), message);
        setTableStats(message.response);
      }
    };
  }, []);

  return (
    <>
      <Typography variant="h4">CurrentTables</Typography>
      {tableStats?.map((t) => {
        return <div key={t.id}>{t.id}</div>;
      })}
    </>
  );
};
