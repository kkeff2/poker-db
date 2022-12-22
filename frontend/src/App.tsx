import { CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TopBar } from "./components/TopBar";

export function App() {
  return (
    <>
      <CssBaseline />
      <TopBar />
      <Outlet />
    </>
  );
}
