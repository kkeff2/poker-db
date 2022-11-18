import { Connection, createConnection } from "mysql2";
import {
  CREATE_DB_SQL,
  CREATE_HAND_HISTORY_TABLE,
  CREATE_PLAYERS_TABLE,
  DB_NAME,
} from "./sql";
require("dotenv").config();

let connection: Connection;

export const con = () => {
  if (!connection) {
    throw new Error("dbConnection not initiated");
  }
  return connection;
};

export const initDb = () => {
  console.log("startDB");
  connection = createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
  });
  connection.connect(function (err) {
    if (err) throw err;
    connection.query(CREATE_DB_SQL, (error) => {
      if (error) throw error;
    });
    connection.query(CREATE_PLAYERS_TABLE, function (error) {
      if (error) throw error;
    });
    connection.query(CREATE_HAND_HISTORY_TABLE, function (error) {
      if (error) throw error;
    });
  });
};
