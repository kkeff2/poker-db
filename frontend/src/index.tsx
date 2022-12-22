import { CssBaseline } from "@mui/material";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { PokerTheme } from "./Theme";
import { ws } from "./webSocket";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
ws.onopen = () => {
  console.log("WS Open. Rendering App");
  root.render(<Root />);
};

function Root() {
  return (
    <PokerTheme>
      <CssBaseline />
      <RouterProvider router={routes} />
    </PokerTheme>
  );
}
