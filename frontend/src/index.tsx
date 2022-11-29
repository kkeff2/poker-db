import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { ws } from "./webSocket";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
ws.onopen = () => {
  console.log("WS Open. Rendering App");
  root.render(<RouterProvider router={routes} />);
};
