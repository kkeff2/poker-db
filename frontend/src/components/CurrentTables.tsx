import { Typography } from "@mui/material";
import type { Messages, Table as TableType } from "poker-db-shared/types";
import { useEffect, useState } from "react";
import { getMessage, sendMessage, ws } from "../webSocket";
import { Table } from "./Table";

export const CurrentTables = () => {
  const [tableStats, setTableStats] = useState<TableType[]>();
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

  const onCloseTable = (tableId: string) => {
    setTableStats((prevTables) => prevTables?.filter((t) => t.id !== tableId));
  };

  return (
    <>
      <Typography variant="h4">CurrentTables</Typography>
      <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
        {tableStats?.map((t) => {
          return <Table key={t.id} table={t} onClose={onCloseTable} />;
        })}
      </div>
    </>
  );
};
