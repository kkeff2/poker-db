import { CircularProgress, Typography } from "@mui/material";
import type { Messages, Table as TableType } from "poker-db-shared/types";
import { useEffect, useState } from "react";
import { getMessage, sendMessage, ws } from "../webSocket";
import { Table } from "./Table";

export const CurrentTables = () => {
  const [tableStats, setTableStats] = useState<TableType[]>();
  const [closedTables, setClosedTabled] = useState<string[]>([]);
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

  if (!tableStats) {
    return <CircularProgress />;
  }

  const openTables = tableStats
    ? tableStats.filter((t) => !closedTables.includes(t.id))
    : tableStats;

  if (!openTables.length) {
    return (
      <div>
        <Typography variant="h5">No active tables</Typography>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
      {openTables.map((t) => {
        return (
          <Table
            key={t.id}
            table={t}
            onClose={(tableId) =>
              setClosedTabled((prevClosedTables) => [
                ...prevClosedTables,
                tableId,
              ])
            }
          />
        );
      })}
    </div>
  );
};
