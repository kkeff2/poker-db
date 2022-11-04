import { RowDataPacket } from "mysql2";
import Query from "mysql2/typings/mysql/lib/protocol/sequences/Query";
import { Hand, PlayerId, PlayerStats } from "../types";
import { getDdCon } from "./init";
import {
  createHandHistoryQuery,
  createPlayerStatsQuery,
  getHandHistoryQuery,
  getPlayerStatsQuery,
} from "./sql";

export interface IHandHistory extends RowDataPacket {
  filename: string;
  last_updated: string;
  last_hand_id_added?: string;
}
export interface IPlayerStats extends PlayerStats, RowDataPacket {}

export const updatePlayerStats = (players: Record<PlayerId, PlayerStats>) => {
  return new Promise((_resolve, reject) => {
    getDdCon().query(createPlayerStatsQuery, Object.entries(players), (err) => {
      if (err) reject(err);
    });
  });
};

export const getPlayerStats = (playerId: string): Promise<IPlayerStats> => {
  return new Promise((resolve, reject) => {
    const sql = getPlayerStatsQuery(playerId);
    getDdCon().query<IHandHistory[]>(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.[0]);
      }
    });
  });
};

export const updateHandHistory = (
  filename: string,
  lastHand: Hand
): Promise<void> => {
  return new Promise((_resolve, reject) => {
    getDdCon().query<IHandHistory[]>(
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
    getDdCon().query<IHandHistory[]>(sql, (error, result) => {
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
): Promise<IHandHistory | undefined> => {
  const sql = getHandHistoryQuery(filename);
  return new Promise((resolve, reject) => {
    getDdCon().query<IHandHistory[]>(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.[0]);
      }
    });
  });
};
