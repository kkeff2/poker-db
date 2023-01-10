import styled from "@emotion/styled";
import { Close } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import type {
  GameForm,
  PokerType,
  Table as TableType,
} from "poker-db-shared/types";

type Props = {
  table: TableType;
  onClose: (tableId: string) => void;
};

export const TableHeader = ({ table, onClose }: Props) => {
  const {
    id,
    lastHand: { pokerType, gameForm, tableId, tableSize, tournamentBuyIn },
  } = table;

  return (
    <>
      <div style={{ position: "absolute", top: "4px", right: "4px" }}>
        <IconButton onClick={() => onClose(id)}>
          <Close />
        </IconButton>
      </div>
      <Typography variant="caption">
        <StyledTableInfo backgroundColor={gameTexts[pokerType].color}>
          {gameTexts[pokerType].label}
        </StyledTableInfo>{" "}
        <StyledTableInfo backgroundColor={gameTexts[gameForm].color}>
          {gameTexts[gameForm].label}
        </StyledTableInfo>{" "}
        {gameForm === "TOURNAMENT" && (
          <StyledTableInfo backgroundColor="#fff9c4" color="#000000">
            {`${tableSize}-MAX $${tournamentBuyIn}`}
          </StyledTableInfo>
        )}
        {" " + tableId + ""}
      </Typography>
    </>
  );
};

export const StyledTableInfo = styled.span<{
  backgroundColor: string;
  color?: string;
}>(({ backgroundColor, color = "white" }) => ({
  backgroundColor,
  color,
  fontWeight: "bold",
  borderRadius: "4px",
  padding: "4px 8px",
}));

const gameTexts: Record<
  GameForm | PokerType,
  { label: string; color: string }
> = {
  CASH_GAME: { label: "CASH", color: "#c62828" },
  TOURNAMENT: { label: "TOURN", color: "#283593" },
  NLHE: { label: "NLHL", color: "#5d4037" },
  PLO: { label: "PLO", color: "#33691e" },
};
