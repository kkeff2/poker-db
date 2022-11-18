import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ws } from "./webSocket";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App ws={ws} />);
