import { RowDataPacket } from "mysql2";
import {
  Hand,
  HandHistory,
  PlayerId,
  PlayerStats,
} from "poker-db-shared/types";
import { con } from "./init";
import {
  allPlayerStatsQuery,
  createHandHistoryQuery,
  createPlayerStatsQuery,
  getHandHistoryQuery,
  playerStatsQuery,
} from "./sql";

export interface IHandHistory extends RowDataPacket, HandHistory {}
export interface IPlayerStats extends RowDataPacket {
  player_id: string;
  data: PlayerStats;
}

type UpdateOpts = {
  players: Record<PlayerId, PlayerStats>;
  handHistory: {
    fileName: string;
    lastHand: Hand;
  };
};

export const updatePlayerStats = ({ players, handHistory }: UpdateOpts) => {
  return new Promise((_resolve, reject) => {
    con().beginTransaction((transactionError) => {
      if (transactionError) {
        throw transactionError;
      }
      // TODO: Get stats first! Then add new stats to that stats
      const values = Object.entries(players).map(([playerId, stats]) => {
        return [playerId, JSON.stringify(stats)];
      });

      con().query(createPlayerStatsQuery, [values], (error) => {
        if (error) {
          return con().rollback(() => {
            reject(error);
          });
        }
      });
      con().query(
        createHandHistoryQuery,
        [handHistory.fileName, handHistory.lastHand.handId],
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
      });
    });
  });
};

export const getPlayerStats = (
  playerIds: string[]
): Promise<IPlayerStats[]> => {
  return new Promise((resolve, reject) => {
    const sql = playerStatsQuery;
    con().query<IPlayerStats[]>(sql, [playerIds], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const getAllPlayerStats = (): Promise<IPlayerStats[]> => {
  return new Promise((resolve, reject) => {
    const sql = allPlayerStatsQuery;
    con().query<IPlayerStats[]>(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
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
