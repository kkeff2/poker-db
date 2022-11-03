export type GameForm = "TOURNAMENT" | "CASH_GAME";
export type PokerType = "NLHE" | "PLO";
export type GameId = `${PokerType}_${GameForm}`;

export type Round = "PRE_FLOP" | "FLOP" | "TURN" | "RIVER";
export type Action = "FOLD" | "CALL" | "RAISE" | "CHECK" | "BET" | "RE_RAISE";
export type PlayerId = string;

export type Hand = {
  handId: string;
  pokerType: PokerType;
  gameForm: GameForm;
  gameId: GameId;
  tournamentId?: string;
  gameName: string;
  tableId: string;
  tableSize: number;
  button: number;
  players: PlayerHand[];
};

export type PlayerHand = {
  id: PlayerId;
  position: number;
  actions: Record<Round, Action[]>;
};

export type RoundStats = {
  seen: number;
  aggression: number;
  perAction: Record<Action, number>;
};

export type GameStats = Record<Round, RoundStats>;

export type PlayerStats = Partial<PokerStats>;

export type PokerStats = Record<GameId, GameStats>;

// const test: PlayerStats = {
//   NLHE: {
//     TOURNAMENT: {
//       FLOP: {},
//       FLOP: {},
//     },
//   },
// };
