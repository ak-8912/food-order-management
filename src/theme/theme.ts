"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#ff5722",
    },
    secondary: {
      main: "#212121",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  shape: {
    borderRadius: 12,
  },
});
