import {
  Card,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow as MuiTableRow,
} from "@mui/material";
import type { Round, Table as TableType } from "poker-db-shared/types";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";

type Props = {
  table: TableType;
  onClose: (tableId: string) => void;
};

export const COLUMNS: {
  label: string;
  round: Round;
  type: "aggression" | "percentage" | "seen";
}[] = [
  { label: "TOTAL", round: "PRE_FLOP", type: "seen" },
  { label: "PF AGG", round: "PRE_FLOP", type: "aggression" },
  // { label: "Flop", round: "FLOP", type: "seen" },
  { label: "FLOP", round: "FLOP", type: "percentage" },
  // { label: "Turn", round: "TURN", type: "seen" },
  { label: "TURN", round: "TURN", type: "percentage" },
  // { label: "River", round: "RIVER", type: "seen" },
  { label: "RIVER", round: "RIVER", type: "percentage" },
];

export const Table = ({ table, onClose }: Props) => {
  return (
    <div key={table.id} style={{ width: "50%" }}>
      <Card
        sx={{
          margin: "12px",
          padding: "8px 12px",
          position: "relative",
        }}
      >
        <TableHeader table={table} onClose={onClose} />

        <MuiTable size="small">
          <TableHead>
            <MuiTableRow>
              <TableCell>PLAYER</TableCell>
              {COLUMNS.map((column) => (
                <TableCell key={`${table.id}${column.round}${column.label}`}>
                  {column.label}
                </TableCell>
              ))}
            </MuiTableRow>
          </TableHead>
          <TableBody>
            {table.playerStats.map((p) => {
              const playerStatsList = Object.entries(p);
              return playerStatsList.map(([playerId, stats]) => {
                return (
                  <TableRow
                    key={`${table.id}${playerId}`}
                    tableId={table.id}
                    playerId={playerId}
                    stats={stats}
                  />
                );
              });
            })}
          </TableBody>
        </MuiTable>
      </Card>
    </div>
  );
};
