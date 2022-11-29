import { Messages } from "poker-db-shared/types";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { CurrentTables } from "./components/CurrentTables";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <CurrentTables />,
      },
      {
        path: "hand-histories",
        element: <div>hand-histories???</div>,
      },
      {
        path: "players",
        element: <div>players???</div>,
      },
    ],
  },
]);
