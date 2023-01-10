import { TableCell, TableRow as MuiTableRow, Typography } from "@mui/material";
import type { PlayerMetrics } from "poker-db-shared/types";
import { COLUMNS } from "./Table";
import { StyledTableInfo } from "./TableHeader";

type Props = {
  tableId: string;
  playerId: string;
  metrics: PlayerMetrics;
};

export const TableRow = ({ tableId, playerId, metrics }: Props) => {
  return (
    <MuiTableRow
      key={`${tableId}${playerId}`}
      style={{
        backgroundColor: metrics.isBestPlayer ? "#e0e0e0" : "inherit",
      }}
    >
      <TableCell>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{playerId}</div>
          <div>
            <Typography variant="caption">
              <StyledTableInfo backgroundColor="black">
                {metrics.aggressionFactor || "-"}
              </StyledTableInfo>
            </Typography>
          </div>
        </div>
      </TableCell>
      {COLUMNS.map((c) => {
        const cellNumber = metrics[c.key];
        const text = c.isPercentage
          ? `${Math.round(cellNumber * 100)}%`
          : cellNumber;
        return <TableCell key={`${playerId}${c.label}`}>{text}</TableCell>;
      })}
    </MuiTableRow>
  );
};
