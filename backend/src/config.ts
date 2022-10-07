export const config = {
  pathToHandHistoryLogs:
    "/Users/kasperbartholdigustavii/Library/Application Support/PokerStarsSE/HandHistory/den_kkeffe",
  pathToTournamentLogs:
    "/Users/kasperbartholdigustavii/Library/Application Support/PokerStarsSE/TournSummary/den_kkeffe",
};

type GameType = "TOURNAMENT" | "CASH_GAME";
type PokerType = "NLHE" | "PLO";

type Hand = {
  handId: string;
  pokerType: PokerType;
  gameType: GameType;
  tournamentId?: string;
  gameName: string;
  tableId: string;
  tableSize: number;
  players: { string: Player };
};

type Player = {
  name: string;
  position: number;
  actions: {
    preFlop: Actions[];
    flop?: Actions[];
    turn?: Actions[];
    river?: Actions[];
  };
};

type Actions = "FOLD" | "CALL" | "RAISE" | "RE_RAISE" | "CHECK";

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
    // preFlop: getPreFlopAction(handRows, players),
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

export const getPlayers = (
  handRows: string[],
  tableSize: number
): { string?: Player } => {
  // TODO: Fix type
  // const buttonPosition = getPositionOnButton(handRows);
  const players: { string?: Player } = {};
  for (let playerIndex = 2; playerIndex <= tableSize + 2; playerIndex++) {
    const row = handRows[playerIndex];
    // TODO: Better check needed? If a player starts with Plats error will occur
    if (!row.startsWith("Plats ")) {
      break;
    }

    const playerName = row.split(":")[1].split("-")[0].split("(")[0].trim();
    players[playerName] = {
      position: parseInt(row.split(" ")[1]),
      name: row.split(":")[1].split("-")[0].split("(")[0].trim(),
      preFlop: [],
    };
  }
  let i = handRows.indexOf(HOLE_CARDS) + 2;
  do {
    const row = handRows[i];
    // console.log("i", i);
    // console.log("ROW", row);
    if (row.indexOf(":") == -1) {
      i++;
      continue;
    }

    const rowList = handRows[i].split(":");
    const playerName = rowList[0];
    const action = rowList[1].split(" ")[1];
    console.log("ACTIONACTION", action);

    players[playerName] = {
      ...players[playerName],
      preFlop: [...players[playerName].preFlop, action],
    };
    i++;
  } while (!(handRows[i].includes(FLOP) || handRows[i].includes(SUMMARY)));
  console.log("players", players);
  return players;
};

const getPreFlopAction = (handRows: string[], players: Player[]) => {
  const positionOnButton = getPositionOnButton(handRows);
  const firstToAct = players.find((p) => positionOnButton == p.name);
};

const HOLE_CARDS = "*** HÅLKORT ***";
const FLOP = "*** FLOPP ***";
const SUMMARY = "*** SAMMANFATTNING ***";
const SHOW_DOWN = "*** VISNING ***";
const RAISE = "raise";
const BET = "bet";
const CALL = "call";
const FOLD = "fold";
const WON = "vann";
