import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { ReactNode, useMemo } from "react";

type Props = {
  children: ReactNode;
};

export const PokerTheme = ({ children }: Props) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          background: {
            default: "#F8F6F3",
          },
        },
      }),
    [prefersDarkMode]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
