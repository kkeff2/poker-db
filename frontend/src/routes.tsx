import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { CurrentTables } from "./components/CurrentTables";

export const handHistoryPath = "hand-histories";
export const playersPath = "players";
export const currentTablesPath = "";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: currentTablesPath,
        element: <CurrentTables />,
      },
      {
        path: handHistoryPath,
        element: <div>hand-histories???</div>,
      },
      {
        path: playersPath,
        element: <div>players???</div>,
      },
    ],
  },
]);
