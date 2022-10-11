export const config = {
  pathToHandHistoryLogs:
    "/Users/kasperbartholdigustavii/Library/Application Support/PokerStarsSE/HandHistory/den_kkeffe",
  pathToTournamentLogs:
    "/Users/kasperbartholdigustavii/Library/Application Support/PokerStarsSE/TournSummary/den_kkeffe",
};

type GameType = "TOURNAMENT" | "CASH_GAME";
type PokerType = "NLHE" | "PLO";
type Round = "PRE_FLOP" | "FLOP" | "TURN" | "RIVER";
type Action = "FOLD" | "CALL" | "RAISE" | "CHECK" | "BET"; // "RE_RAISE" |
type PlayerId = string;

type Hand = {
  handId: string;
  pokerType: PokerType;
  gameType: GameType;
  tournamentId?: string;
  gameName: string;
  tableId: string;
  tableSize: number;
  players: PlayerHand[];
};

export type PlayerHand = {
  name: PlayerId;
  position: number;
  actions: {
    preFlop: Action[];
    flop: Action[];
    turn: Action[];
    river: Action[];
  };
};

export const getHandInfo = (hand: string): Hand => {
  const handRows = hand.split("\n");
  const tableSize = getTableSize(handRows);
  const players = getPlayers(handRows, tableSize);
  return {
    tableSize,
    players,
    handId: getHandId(handRows),
    gameType: getGameType(handRows),
    pokerType: "NLHE",
    tournamentId:
      getGameType(handRows) == "TOURNAMENT"
        ? getTournamentId(handRows)
        : undefined,
    gameName: getGameName(handRows),
    tableId: getTableId(handRows),
  };
};

const handIndex = 0;
const tableIndex = 1;

export const getHandId = (handRows: string[]) => {
  return handRows[0].split(" ")[3];
};

export const getGameType = (handRows: string[]): GameType => {
  return handRows[0].includes("Turnering") ? "TOURNAMENT" : "CASH_GAME";
};

export const getTournamentId = (handRows: string[]) => {
  return handRows[0].split("#")[1].split(",")[0];
};

export const getGameName = (handRows: string[]) => {
  return handRows[0].split(":")[1].split("-")[0].trim();
};

export const getTableId = (handRows: string[]) => {
  return handRows[1].split("'")[1];
};

export const getTableSize = (handRows: string[]) => {
  const tableSizePosition = handRows[1].search("-max");
  return parseInt(handRows[1].charAt(tableSizePosition - 1));
};

export const getPositionOnButton = (handRows: string[]) => {
  return handRows[tableIndex].split("#")[1].charAt(0);
};

const getAction = (possibleAction: string): Action => {
  switch (possibleAction) {
    case FOLD:
      return "FOLD";
    case CALL:
      return "CALL";
    case RAISE:
      return "RAISE";
    case CHECK:
      return "CHECK";
    case BET:
      return "BET";
    default:
      throw Error(`${possibleAction} is not a Action`);
  }
};

const getRoundActionsRows = (round: Round, handRows: string[]) => {
  const config = actionsConfig[round];
  const startIndex = handRows.findIndex((row) => {
    return row.startsWith(config.startString);
  });
  if (startIndex == -1) {
    return [];
  }

  const endIndex = handRows.findIndex((row) => {
    return row.startsWith(config.endString) || row.startsWith(SUMMARY);
  });
  const roundRows = handRows.splice(startIndex, endIndex - startIndex);
  const roundActionRows = roundRows.filter((row) => row.indexOf(":") != -1);
  // Filter out shows action
  return roundActionRows.filter((row) => {
    return !row.split(":")[1].trim().startsWith(SHOWS);
  });
};

const getPlayerRoundActions = ({
  roundRows,
  playerId,
}: {
  roundRows: string[];
  playerId: PlayerId;
}) => {
  const playerRounds = roundRows.filter((row) => row.startsWith(playerId));
  const actions = playerRounds.map((row) =>
    getAction(row.split(":")[1].split(" ")[1])
  );
  return actions;
};

const getPlayersTableInfo = (handRows: string[], tableSize: number) => {
  let players: Omit<PlayerHand, "actions">[] = [];
  for (let playerIndex = 2; playerIndex <= tableSize + 2; playerIndex++) {
    const row = handRows[playerIndex];
    // TODO: Better check needed? If a player starts with Plats error will occur
    if (!row.startsWith("Plats ")) {
      break;
    }

    const playerName = row.split(":")[1].split("-")[0].split("(")[0].trim();
    const player: Omit<PlayerHand, "actions"> = {
      position: parseInt(row.split(" ")[1]),
      name: playerName,
    };
    players.push(player);
  }
  return players;
};

export const getPlayers = (
  handRows: string[],
  tableSize: number
): PlayerHand[] => {
  const playersWithTableInfo = getPlayersTableInfo(handRows, tableSize);
  const roundActionRows = {
    preFlop: getRoundActionsRows("PRE_FLOP", handRows),
    flop: getRoundActionsRows("FLOP", handRows),
    turn: getRoundActionsRows("TURN", handRows),
    river: getRoundActionsRows("RIVER", handRows),
  };
  const players: PlayerHand[] = playersWithTableInfo.map((player) => {
    return {
      ...player,
      actions: {
        preFlop: getPlayerRoundActions({
          roundRows: roundActionRows.preFlop,
          playerId: player.name,
        }),
        flop: getPlayerRoundActions({
          roundRows: roundActionRows.flop,
          playerId: player.name,
        }),
        turn: getPlayerRoundActions({
          roundRows: roundActionRows.turn,
          playerId: player.name,
        }),
        river: getPlayerRoundActions({
          roundRows: roundActionRows.river,
          playerId: player.name,
        }),
      },
    };
  });
  return players;
};

// ROUNDS
const HOLE_CARDS_DIVIDER = "*** HÅLKORT ***";
const FLOP_DIVIDER = "*** FLOPP ***";
const TURN_DIVIDER = "*** TURN ***";
const RIVER_DIVIDER = "*** RIVER ***";
const SHOW_DIVIDER = "*** VISNING ***";
const SUMMARY = "*** SAMMANFATTNING ***";

// ACTIONS
const RAISE = "raise";
const BET = "bet";
const CALL = "call";
const FOLD = "fold";
// const WON = "vann";
const CHECK = "check";
const SHOWS = "visar";

const actionsConfig: Record<
  Round,
  { startString: string; endString: string; key: string }
> = {
  PRE_FLOP: {
    startString: HOLE_CARDS_DIVIDER,
    endString: FLOP_DIVIDER,
    key: "preFlop",
  },
  FLOP: { startString: FLOP_DIVIDER, endString: TURN_DIVIDER, key: "flop" },
  TURN: { startString: TURN_DIVIDER, endString: RIVER_DIVIDER, key: "turn" },
  RIVER: { startString: RIVER_DIVIDER, endString: SHOW_DIVIDER, key: "river" },
};
