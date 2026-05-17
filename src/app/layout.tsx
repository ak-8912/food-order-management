"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryProvider } from "@/components/common/query-provider";
import { theme } from "@/theme/theme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
