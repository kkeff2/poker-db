import { CssBaseline, Typography } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { currentTablesPath, handHistoryPath, playersPath } from "./routes";

export function App() {
  const { pathname } = useLocation();
  const labels = {
    [`/${handHistoryPath}`]: "Hand Histories",
    [`/${playersPath}`]: "Players",
    [`/${currentTablesPath}`]: "Current Tables",
  };
  return (
    <>
      <CssBaseline />
      <TopBar />
      <div style={{ padding: "20px 12px" }}>
        <Typography variant="h4">{labels[pathname]}</Typography>
        <Outlet />
      </div>
    </>
  );
}
