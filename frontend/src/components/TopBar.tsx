import { AppBar, MenuItem, Toolbar, Typography } from "@mui/material";
import { AttachMoneyOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

const pages = [
  { route: "/", label: "Current Tables" },
  { route: "/hand-histories", label: "Hand Histories" },
  { route: "/players", label: "Players" },
];

export const TopBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <AttachMoneyOutlined />
        <Typography variant="h5" style={{ marginRight: "12px" }}>
          PokerDB
        </Typography>
        {pages.map((page) => (
          <MenuItem key={page.route}>
            <Link style={{ textDecoration: "none" }} to={page.route}>
              <Typography textAlign="center">{page.label}</Typography>
            </Link>
          </MenuItem>
        ))}
      </Toolbar>
    </AppBar>
  );
};
