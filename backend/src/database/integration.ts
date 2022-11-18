import { RowDataPacket } from "mysql2";
import Query from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import { Hand, PlayerId, PlayerStats } from "../types";
import { con } from "./init";
import {
  allHandHistoriesQuery,
  createHandHistoryQuery,
  createPlayerStatsQuery,
  getHandHistoryQuery,
  playerStatsQuery,
} from "./sql";

export interface IHandHistory extends RowDataPacket {
  filename: string;
  last_updated: string;
  last_hand_id_added?: string;
}
export interface IPlayerStats extends RowDataPacket {
  player_id: string;
  data: string;
}

type UpdateOpts = {
  players: Record<PlayerId, PlayerStats>;
  handHistory: {
    filename: string;
    lastHand: Hand;
  };
};

export const updatePlayerStats = ({ players, handHistory }: UpdateOpts) => {
  return new Promise((_resolve, reject) => {
    console.log("before", players);
    const [playerId, playerStats] = Object.entries(players);
    con().beginTransaction((transactionError) => {
      if (transactionError) {
        throw transactionError;
      }
      con().query(
        createPlayerStatsQuery,
        [playerId, JSON.stringify(playerStats)],
        (error, results) => {
          if (error) {
            return con().rollback(() => {
              reject(error);
            });
          }
          console.log("update players results", results);
        }
      );
      con().query(
        createHandHistoryQuery,
        [handHistory.filename, handHistory.lastHand.handId],
        (error) => {
          if (error) {
            return con().rollback(() => {
              reject(error);
            });
          }
        }
      );
      con().commit(function (err) {
        if (err) {
          return con().rollback(function () {
            throw err;
          });
        }
        console.log("success!");
      });
    });
  });
};

export const getPlayerStats = (playerIds: string[]): Promise<IPlayerStats> => {
  return new Promise((resolve, reject) => {
    const sql = playerStatsQuery;
    con().query<IPlayerStats[]>(sql, playerIds, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.[0]);
      }
    });
  });
};

export const getAllPlayerStats = (): Promise<IHandHistory[]> => {
  return new Promise((resolve, reject) => {
    const sql = allHandHistoriesQuery;
    con().query<IHandHistory[]>(sql, (error, result) => {
      if (error) {
        console.log({ error });
        reject(error);
      } else {
        console.log({ result });
        resolve(result);
      }
    });
  });
};

export const updateHandHistory = (
  filename: string,
  lastHand: Hand
): Promise<void> => {
  return new Promise((_resolve, reject) => {
    con().query<IHandHistory[]>(
      createHandHistoryQuery,
      [filename, lastHand.handId],
      (err) => {
        if (err) reject(err);
      }
    );
  });
};

export const getHandHistories = async (
  filename: string
): Promise<IHandHistory | undefined> => {
  const sql = getHandHistoryQuery(filename);
  return new Promise((resolve, reject) => {
    con().query<IHandHistory[]>(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.[0]);
      }
    });
  });
};

export const updatePlayers = async (
  filename: string
): Promise<IPlayerStats | undefined> => {
  const sql = getHandHistoryQuery(filename);
  return new Promise((resolve, reject) => {
    con().query<IPlayerStats[]>(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.[0]);
      }
    });
  });
};
