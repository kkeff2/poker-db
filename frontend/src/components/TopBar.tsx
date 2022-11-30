import { AttachMoneyOutlined } from "@mui/icons-material";
import { AppBar, MenuItem, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const pages = [
  { route: "/", label: "Current Tables" },
  { route: "/hand-histories", label: "Hand Histories" },
  { route: "/players", label: "Players" },
];

export const TopBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <AttachMoneyOutlined />
        <Typography variant="h5" style={{ marginRight: "12px" }}>
          PokerDB
        </Typography>
        {pages.map((page) => (
          <MenuItem key={page.route} onClick={() => navigate(page.route)}>
            <Typography textAlign="center">{page.label}</Typography>
          </MenuItem>
        ))}
      </Toolbar>
    </AppBar>
  );
};
