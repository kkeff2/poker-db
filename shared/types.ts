export interface HandHistory {
  filename: string;
  last_updated: Date;
  last_hand_id_added?: string;
}

type CurrentTableResponse = {
  hand: Hand;
  playerStats: {
    playerId: string;
    stats: GameStats;
  }[];
}[];

export type Messages =
  | {
      type: "WEB_SOCKET_CONNECTED";
    }
  | { type: "GET_ALL_PLAYER_STATS"; response: HandHistory }
  | { type: "GET_ALL_HAND_HISTORIES"; response: HandHistory }
  | {
      type: "CURRENT_TABLE_UPDATED";
      response: CurrentTableResponse;
    };

export type MessagesWithoutResponse = Omit<Messages, "response">;

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
};

export type RoundStats = {
  seen: number;
  aggression: number;
  perAction: Record<Action, number>;
};

export type GameStats = Record<Round, RoundStats>;

export type PlayerStats = Partial<PokerStats>;

export type PokerStats = Record<GameId, GameStats>;
