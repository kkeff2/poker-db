import { Action, Round } from "./types";

export const ROUNDS: Round[] = ["FLOP", "PRE_FLOP", "RIVER", "TURN"];
export const ACTIONS: Action[] = [
  "FOLD",
  "CALL",
  "RAISE",
  "CHECK",
  "BET",
  "RE_RAISE",
];

// ROUNDS
export const HOLE_CARDS_DIVIDER = "*** HÅLKORT ***";
export const FLOP_DIVIDER = "*** FLOPP ***";
export const TURN_DIVIDER = "*** TURN ***";
export const RIVER_DIVIDER = "*** RIVER ***";
export const SHOW_DIVIDER = "*** VISNING ***";
export const SUMMARY = "*** SAMMANFATTNING ***";

// Other
export const PLACE = "Plats";
export const TOURNAMENT = "Turnering";
export const HOLDEM_NO_LIMIT = "Holdem No limit";

// ACTIONS
export const RAISE = "raise";
export const BET = "bet";
export const CALL = "call";
export const FOLD = "fold";
// export const WON = "vann";
export const CHECK = "check";
export const SHOWS = "visar";

export const config = {
  pathToHandHistoryLogs:
    "/Users/kasperbartholdigustavii/Library/Application Support/PokerStarsSE/HandHistory/den_kkeffe",
  pathToTournamentLogs:
    "/Users/kasperbartholdigustavii/Library/Application Support/PokerStarsSE/TournSummary/den_kkeffe",
};
