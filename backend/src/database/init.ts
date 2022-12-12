import { Connection, createConnection } from "mysql2";
import {
  CREATE_DB_SQL,
  CREATE_HAND_HISTORY_TABLE,
  CREATE_PLAYERS_TABLE,
  DB_NAME,
} from "./sql";
require("dotenv").config();

let dbConnection: Connection;

export const con = () => {
  if (!dbConnection) {
    throw new Error("dbConnection not initiated");
  }
  return dbConnection;
};

const createDb = (): Promise<void> =>
  new Promise((resolve, reject) => {
    dbConnection.connect(function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });

const runQuery = (query: string): Promise<void> =>
  new Promise((resolve, reject) => {
    dbConnection.query(query, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });

export const initDb = async () => {
  dbConnection = createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
  });

  await createDb();
  await runQuery(CREATE_DB_SQL);
  await runQuery(CREATE_PLAYERS_TABLE);
  await runQuery(CREATE_HAND_HISTORY_TABLE);
};
