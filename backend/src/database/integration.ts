import { RowDataPacket } from "mysql2";
import { Hand, HandHistory, PlayerStats } from "poker-db-shared/types";
import { con } from "./init";
import {
  allHandHistoriesQuery,
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
  playersUpdate: string[][];
  handHistory: {
    id: string;
    lastHand: Hand;
    lastUpdated: string;
  };
};

export const updatePlayerStats = ({
  playersUpdate,
  handHistory: { id, lastHand, lastUpdated },
}: UpdateOpts): Promise<void> => {
  return new Promise((resolve, reject) => {
    con().beginTransaction(async (transactionError) => {
      if (transactionError) {
        reject(transactionError);
      }

      con().query(createPlayerStatsQuery, [playersUpdate], (error) => {
        // if error on other update we should rollback first query
        if (error) {
          return con().rollback(() => {
            reject(error);
          });
        } else {
          con().query(
            createHandHistoryQuery,
            [id, lastUpdated, JSON.stringify(lastHand)],
            (error) => {
              if (error) {
                return con().rollback(() => {
                  reject(error);
                });
              } else {
                con().commit(function (err) {
                  if (err) {
                    return con().rollback(function () {
                      reject(err);
                    });
                  } else {
                    console.log("FINAL COMMIT!!!!!!!!");
                    resolve();
                  }
                });
              }
            }
          );
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

export const updateHandHistoryDb = ({
  id,
  lastHand,
  lastUpdated,
}: UpdateOpts["handHistory"]): Promise<void> => {
  return new Promise((resolve, reject) => {
    con().query<IHandHistory[]>(
      createHandHistoryQuery,
      [id, lastUpdated, JSON.stringify(lastHand)],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

export const getHandHistories = async (
  ids: string[]
): Promise<IHandHistory[] | undefined> => {
  return new Promise((resolve, reject) => {
    con().query<IHandHistory[]>(getHandHistoryQuery, [ids], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const getAllHandHistories = async (): Promise<IHandHistory[]> => {
  return new Promise((resolve, reject) => {
    con().query<IHandHistory[]>(allHandHistoriesQuery, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
