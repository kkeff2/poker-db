import { Connection, createConnection } from "mysql2";
import { CREATE_DB_SQL, CREATE_PLAYERS_TABLE } from "./sql";
require("dotenv").config();

let dbConnection: Connection;

export const getDbConnection = () => {
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
    database: process.env.DB_NAME,
  });
  dbConnection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    dbConnection.query(CREATE_DB_SQL, (error) => {
      if (error) throw error;
      console.log("Database created");
    });
    dbConnection.query(CREATE_PLAYERS_TABLE, function (error) {
      if (error) throw error;
      console.log("Table created");
    });
  });
};
