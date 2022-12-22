import { TableCell, TableRow as MuiTableRow } from "@mui/material";
import type { GameStats } from "poker-db-shared/types";
import { COLUMNS } from "./Table";

type Props = {
  tableId: string;
  playerId: string;
  stats: GameStats;
};

export const TableRow = ({ tableId, playerId, stats }: Props) => {
  return (
    <MuiTableRow
      key={`${tableId}${playerId}`}
      style={{
        backgroundColor: isBestPlayer(playerId) ? "#e0e0e0" : "inherit",
        // cursor: "pointer",
      }}
    >
      <TableCell>{playerId}</TableCell>
      {COLUMNS.map((c) => {
        return (
          <TableCell key={`${playerId}${c.label}${c.round}`}>
            {getCellValue(c, stats)}
          </TableCell>
        );
      })}
    </MuiTableRow>
  );
};

const getCellValue = (
  { type, round }: typeof COLUMNS[number],
  stats: GameStats
) => {
  switch (type) {
    case "aggression":
      return stats[round].seen
        ? `${getPercentage(stats[round].seen, stats[round].aggression)}%`
        : "-";
    case "percentage":
      return stats[round].seen
        ? `${getPercentage(stats.PRE_FLOP.seen, stats[round].seen)}%`
        : "-";
    case "seen":
      return stats[round].seen ? stats[round].seen : "-";
  }
};

const getPercentage = (preFlopSeen: number, postFlopSeen: number) => {
  return Math.round((postFlopSeen / preFlopSeen) * 100);
};

const isBestPlayer = (playerId: string) => playerId === "den_kkeffe";
