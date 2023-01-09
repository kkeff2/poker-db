export interface HandHistory {
  hand_history_id: string;
  last_updated: string;
  last_hand: Hand;
}

export type Table = {
  id: string;
  lastHand: Hand;
  playerStats: Record<PlayerId, GameStats & { aggressionFactor: number }>[];
  hasBeenSent: boolean;
};

export type Messages =
  | {
      type: "WEB_SOCKET_CONNECTED";
    }
  | { type: "GET_ALL_PLAYER_STATS"; response: HandHistory }
  | { type: "GET_ALL_HAND_HISTORIES"; response: HandHistory }
  | {
      type: "CURRENT_TABLE_UPDATED";
      response: Table[];
    };

export type MessagesWithoutResponse = Omit<Messages, "response">;

export type Hand = {
  handId: string;
  pokerType: PokerType;
  gameForm: GameForm;
  gameId: GameId;
  tournamentId?: string;
  tournamentBuyIn?: number;
  gameName: string;
  tableId: string;
  tableSize: number;
  button: number;
  players: PlayerHand[];
};

export type GameForm = "TOURNAMENT" | "CASH_GAME";
export type PokerType = "NLHE" | "PLO";
export type GameId = `${PokerType}_${GameForm}`;

export type Round = "PRE_FLOP" | "FLOP" | "TURN" | "RIVER";
export type Action = "FOLD" | "CALL" | "RAISE" | "CHECK" | "BET" | "RE_RAISE";
export type PlayerId = string;

export type PlayerHand = {
  id: PlayerId;
  position: number;
  actions: Record<Round, Action[]>;
  isBestPlayer: boolean;
};

export type PerAction = Record<Action, number>;

export type RoundAction = {
  seen: number;
  voluntarilyPutMoneyInPot: number;
  aggression: number;
  // If any raise at all was performed that round
  raiseInRound: number;
  perAction: PerAction;
};

export type GameStats = Record<Round, RoundAction>;

export type PlayerStats = Partial<PokerStats>;

export type PokerStats = Record<GameId, GameStats>;

export type ReturnGameStats = {
  totalHands: number;
  flopsSeen: number;
  turnsSeen: number;
  riversSeen: number;
  voluntarilyPutMoneyInPot: number;
  preFlopRaise: number;
  aggressionFactor: number;
};
