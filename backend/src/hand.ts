import {
  FOLD,
  CALL,
  RAISE,
  CHECK,
  BET,
  SUMMARY,
  SHOWS,
  HOLE_CARDS_DIVIDER,
  FLOP_DIVIDER,
  TURN_DIVIDER,
  RIVER_DIVIDER,
  SHOW_DIVIDER,
  ROUNDS,
  PLACE,
  TOURNAMENT,
  HOLDEM_NO_LIMIT,
} from "./constants";
import {
  Action,
  GameForm,
  GameId,
  Hand,
  PlayerHand,
  PlayerId,
  PokerType,
  Round,
} from "./types";

const getPlayerRows = (handRows: string[]) => {
  // Places start at
  let index = 2;
  const playerRows = [];
  while (handRows[index].startsWith(PLACE)) {
    playerRows.push(handRows[index]);
    index++;
  }
  return playerRows;
};

const handParts = (handRows: string[]) => {
  return {
    gameRow: handRows[0],
    tableRow: handRows[1],
    playerRows: getPlayerRows(handRows),
    roundsRows: {
      PRE_FLOP: getRoundRows("PRE_FLOP", handRows),
      FLOP: getRoundRows("FLOP", handRows),
      TURN: getRoundRows("TURN", handRows),
      RIVER: getRoundRows("RIVER", handRows),
    },
  };
};

export const getHandInfo = (hand: string): Hand => {
  const handRows = hand.split("\n");
  const { gameRow, tableRow, playerRows, roundsRows } = handParts(handRows);

  const tableSize = getTableSize(tableRow);
  const players = getHandAction(playerRows, roundsRows);
  const gameForm = getGameForm(gameRow);
  const pokerType = getPokerType(gameRow);
  return {
    tableSize,
    players,
    gameForm,
    pokerType,
    gameId: getGameId({ gameForm, pokerType }),
    button: getPositionOnButton(handRows),
    handId: getHandId(handRows),
    tournamentId:
      gameForm == "TOURNAMENT" ? getTournamentId(handRows) : undefined,
    gameName: getGameName(handRows),
    tableId: getTableId(handRows),
  };
};

const tableIndex = 1;

const getGameId = ({
  gameForm,
  pokerType,
}: {
  gameForm: GameForm;
  pokerType: PokerType;
}): GameId => {
  return `${pokerType}_${gameForm}`;
};

export const getHandId = (handRows: string[]) => {
  return handRows[0].split(" ")[3];
};

export const getGameForm = (gameRow: string): GameForm => {
  return gameRow.includes(TOURNAMENT) ? "TOURNAMENT" : "CASH_GAME";
};

export const getTournamentId = (handRows: string[]) => {
  return handRows[0].split("#")[1].split(",")[0];
};

export const getPokerType = (gameRow: string): PokerType => {
  if (gameRow.includes(HOLDEM_NO_LIMIT)) {
    return "NLHE";
  }
  if (gameRow.includes("PLO")) {
    return "PLO";
  }
  throw new Error("Unknown PokerType");
};

export const getGameName = (handRows: string[]) => {
  return handRows[0].split(":")[1].split("-")[0].trim();
};

export const getTableId = (handRows: string[]) => {
  return handRows[1].split("'")[1];
};

export const getTableSize = (tableRow: string) => {
  const tableSizePosition = tableRow.search("-max");
  return parseInt(tableRow.charAt(tableSizePosition - 1));
};

export const getPositionOnButton = (handRows: string[]) => {
  return parseInt(handRows[tableIndex].split("#")[1].charAt(0));
};

const getAction = (
  possibleAction: string,
  hasPreviousAggression = false
): Action => {
  switch (possibleAction) {
    case FOLD:
      return "FOLD";
    case CALL:
      return "CALL";
    case RAISE:
      return hasPreviousAggression ? "RE_RAISE" : "RAISE";
    case CHECK:
      return "CHECK";
    case BET:
      return "BET";
    default:
      throw Error(`${possibleAction} is not a Action`);
  }
};

const getRoundRows = (round: Round, handRows: string[]) => {
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
}): Action[] => {
  const firstAggressionIndex = roundRows.findIndex((row) => {
    const action = getAction(row.split(":")[1].split(" ")[1]);
    return action == "BET" || action == "RAISE";
  });

  const actions = roundRows.map((row, i) => {
    if (row.startsWith(playerId)) {
      return getAction(
        row.split(":")[1].split(" ")[1],
        firstAggressionIndex < i
      );
    } else {
      return undefined;
    }
  });

  const isAction = (action: Action | undefined): action is Action => {
    return !!action;
  };

  return actions.filter(isAction);
};

const getPlayersInHand = (
  playerRows: string[]
): Omit<PlayerHand, "actions">[] => {
  return playerRows.map((row) => {
    const playerName = row.split(":")[1].split("-")[0].split("(")[0].trim();
    return {
      position: parseInt(row.split(" ")[1]),
      id: playerName,
    };
  });
};

export const getHandAction = (
  playerRows: string[],
  roundRows: Record<Round, string[]>
): PlayerHand[] => {
  const playersInHand = getPlayersInHand(playerRows);

  const players: PlayerHand[] = playersInHand.map((player) => {
    return {
      ...player,
      actions: ROUNDS.reduce(
        (previousValue: Record<Round, Action[]>, round: Round) => {
          return {
            ...previousValue,
            [round]: getPlayerRoundActions({
              roundRows: roundRows[round],
              playerId: player.id,
            }),
          };
        },
        {} as Record<Round, Action[]>
      ),
    };
  });

  return players;
};

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
