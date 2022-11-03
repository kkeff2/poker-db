import { Connection, createConnection } from "mysql2";
import {
  CREATE_DB_SQL,
  CREATE_HAND_HISTORY_TABLE,
  CREATE_PLAYERS_TABLE,
  DB_NAME,
} from "./sql";
require("dotenv").config();

let dbConnection: Connection;

export const getDdCon = () => {
  if (!dbConnection) {
    throw new Error("dbConnection not initiated");
  }
  return dbConnection;
};

export const initDb = () => {
  console.log("startDB");
  dbConnection = createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
  });
  dbConnection.connect(function (err) {
    if (err) throw err;
    dbConnection.query(CREATE_DB_SQL, (error) => {
      if (error) throw error;
    });
    dbConnection.query(CREATE_PLAYERS_TABLE, function (error) {
      if (error) throw error;
    });
    dbConnection.query(CREATE_HAND_HISTORY_TABLE, function (error) {
      if (error) throw error;
    });
  });
};
