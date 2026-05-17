"use client";

import { Box } from "@mui/material";
import { MenuCard, type MenuItemView } from "./menu-card";

type MenuGridProps = {
  items: MenuItemView[];
};

export function MenuGrid({ items }: MenuGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: { xs: 2, md: 3 },
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
      }}
    >
      {items.map((item) => (
        <MenuCard key={item.id} item={item} />
      ))}
    </Box>
  );
}
