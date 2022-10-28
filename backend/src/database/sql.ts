export const DB_NAME = "poker_db";
const PLAYERS_TABLE = "players";
const HAND_HISTORIES_TABLE = "hand_histories";

export const CREATE_DB_SQL = `CREATE DATABASE IF NOT EXISTS ${DB_NAME};`;
export const CREATE_PLAYERS_TABLE = `CREATE TABLE IF NOT EXISTS ${PLAYERS_TABLE} ( user_name VARCHAR(255) NOT NULL, data JSON NOT NULL )`;
export const CREATE_HAND_HISTORY_TABLE = `CREATE TABLE IF NOT EXISTS ${HAND_HISTORIES_TABLE} ( filename VARCHAR(255) NOT NULL, last_updated TIMESTAMP, last_hand_id_added VARCHAR(255) )`;
