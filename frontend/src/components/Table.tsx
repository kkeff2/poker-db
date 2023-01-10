import {
  Card,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow as MuiTableRow,
} from "@mui/material";
import type { PlayerMetrics, Table as TableType } from "poker-db-shared/types";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";

type Props = {
  table: TableType;
  onClose: (tableId: string) => void;
};

export const COLUMNS: {
  label: string;
  key: keyof Omit<PlayerMetrics, "aggressionFactor" | "isBestPlayer">;
  isPercentage: boolean;
}[] = [
  { label: "VPIP", key: "voluntarilyPutMoneyInPot", isPercentage: true },
  { label: "PFR", key: "preFlopRaise", isPercentage: true },
  { label: "HANDS", key: "totalHands", isPercentage: false },
  { label: "FLOP", key: "flopsSeen", isPercentage: true },
  { label: "TURN", key: "turnsSeen", isPercentage: true },
  { label: "RIVER", key: "riversSeen", isPercentage: true },
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
                <TableCell key={`${table.id}${column.label}`}>
                  {column.label}
                </TableCell>
              ))}
            </MuiTableRow>
          </TableHead>
          <TableBody>
            {table.playerMetrics.map((p) => {
              return (
                <TableRow
                  key={`${table.id}${p.playerId}`}
                  tableId={table.id}
                  playerId={p.playerId}
                  metrics={p.metrics}
                />
              );
            })}
          </TableBody>
        </MuiTable>
      </Card>
    </div>
  );
};
