import { Close } from "@mui/icons-material";
import {
  Card,
  Typography,
  Table as MuiTable,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
} from "@mui/material";
import type { Round, Table as TableType } from "poker-db-shared/types";

type Props = {
  table: TableType;
  onClose: (tableId: string) => void;
};

export const ROUNDS: Round[] = ["PRE_FLOP", "FLOP", "TURN", "RIVER"];

const getPercentage = (preFlopSeen: number, postFlopSeen: number) => {
  return Math.round((postFlopSeen / preFlopSeen) * 100);
};

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
        <div style={{ position: "absolute", top: "4px", right: "4px" }}>
          <IconButton onClick={() => onClose(table.id)}>
            <Close />
          </IconButton>
        </div>
        <Typography variant="caption">{table.id}</Typography>

        <MuiTable size="small">
          <TableHead>
            <TableRow>
              <TableCell>PLAYER</TableCell>
              {ROUNDS.map((round) => (
                <TableCell>{round}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {table.playerStats.map((p) => {
              const playerStatsList = Object.entries(p);

              return playerStatsList.map(([playerId, stats]) => {
                return (
                  <TableRow key={`${table.id}${playerId}`}>
                    <TableCell>{playerId}</TableCell>
                    {ROUNDS.map((round) => {
                      const percentage =
                        round !== "PRE_FLOP"
                          ? ` (${getPercentage(
                              stats.PRE_FLOP.seen,
                              stats[round].seen
                            )}%)`
                          : "";
                      return (
                        <TableCell>{`${stats[round].seen}${percentage}`}</TableCell>
                      );
                    })}
                  </TableRow>
                );
              });
            })}
          </TableBody>
        </MuiTable>
      </Card>
    </div>
  );
};
