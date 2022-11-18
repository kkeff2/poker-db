import { Hand } from "../types";

export const DB_NAME = "poker_db";
const PLAYERS_TABLE = "players";
const HAND_HISTORIES_TABLE = "hand_histories";

export const CREATE_DB_SQL = `CREATE DATABASE IF NOT EXISTS ${DB_NAME};`;
export const CREATE_PLAYERS_TABLE = `CREATE TABLE IF NOT EXISTS ${PLAYERS_TABLE} ( player_id VARCHAR(255) NOT NULL PRIMARY KEY, data JSON NOT NULL )`;
export const CREATE_HAND_HISTORY_TABLE = `CREATE TABLE IF NOT EXISTS ${HAND_HISTORIES_TABLE} ( filename VARCHAR(255) NOT NULL PRIMARY KEY, last_updated TIMESTAMP NOT NULL, last_hand_id_added VARCHAR(255) )`;

export const getHandHistoryQuery = (filename: string): string => {
  return `SELECT * FROM ${HAND_HISTORIES_TABLE} WHERE filename="${filename}"`;
};

export const createHandHistoryQuery =
  `UPDATE INTO ${HAND_HISTORIES_TABLE} ` +
  "(filename, last_updated, last_hand_id_added) " +
  "VALUES(?, now(), ?) " +
  "ON DUPLICATE KEY UPDATE " +
  "last_updated = VALUES(last_updated)," +
  "last_hand_id_added = VALUES(last_hand_id_added)";

export const createPlayerStatsQuery =
  `UPDATE INTO ${PLAYERS_TABLE}` +
  `(player_id, data) VALUES(?,?)` +
  "ON DUPLICATE KEY UPDATE " +
  "data = VALUES(data)";

export const playerStatsQuery = `SELECT * FROM ${HAND_HISTORIES_TABLE} WHERE player_id IN (?)`;

export const allHandHistoriesQuery = `SELECT * FROM ${HAND_HISTORIES_TABLE}`;
