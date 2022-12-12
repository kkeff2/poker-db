export const DB_NAME = "poker_db";
const PLAYERS_TABLE = "players";
const HAND_HISTORIES_TABLE = "hand_histories";

export const CREATE_DB_SQL = `CREATE DATABASE IF NOT EXISTS ${DB_NAME};`;
export const CREATE_PLAYERS_TABLE = `CREATE TABLE IF NOT EXISTS ${PLAYERS_TABLE} ( player_id VARCHAR(255) NOT NULL PRIMARY KEY, data JSON NOT NULL )`;
export const CREATE_HAND_HISTORY_TABLE = `CREATE TABLE IF NOT EXISTS ${HAND_HISTORIES_TABLE} ( hand_history_id VARCHAR(255) NOT NULL PRIMARY KEY, last_updated VARCHAR(255) NOT NULL, last_hand JSON NOT NULL )`;

export const getHandHistoryQuery = `SELECT * FROM ${HAND_HISTORIES_TABLE} WHERE hand_history_id IN (?)"`;

export const createHandHistoryQuery =
  `INSERT INTO ${HAND_HISTORIES_TABLE} ` +
  "(hand_history_id, last_updated, last_hand) " +
  "VALUES(?, ?, ?) " +
  "ON DUPLICATE KEY UPDATE " +
  "last_updated = VALUES(last_updated)," +
  "last_hand = VALUES(last_hand)";

export const createPlayerStatsQuery =
  `INSERT INTO ${PLAYERS_TABLE} ` +
  "(player_id, data) " +
  "VALUES ? " +
  "ON DUPLICATE KEY UPDATE " +
  "data = VALUES(data)";

export const playerStatsQuery = `SELECT * FROM ${PLAYERS_TABLE} WHERE player_id IN (?)`;

export const allPlayerStatsQuery = `SELECT * FROM ${PLAYERS_TABLE}`;

export const allHandHistoriesQuery = `SELECT * FROM ${HAND_HISTORIES_TABLE}`;
