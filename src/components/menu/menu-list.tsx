"use client";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCartStore } from "@/store/cart-store";
import { MenuGrid } from "./menu-grid";
import type { MenuItemView } from "./menu-card";

type MenuListProps = {
  items: MenuItemView[];
  query?: string;
};

export function MenuList({ items, query = "" }: MenuListProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const resultLabel = useMemo(() => {
    const count = `${items.length} item${items.length === 1 ? "" : "s"}`;
    return query ? `${count} matching "${query}"` : count;
  }, [items.length, query]);

  return (
    <>
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: { xs: 3, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
              sx={{
                alignItems: { xs: "stretch", md: "flex-end" },
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  color="primary"
                  component="p"
                  sx={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}
                >
                  Food Order Management
                </Typography>
                <Typography
                  component="h1"
                  variant="h3"
                  sx={{
                    mt: 1,
                    fontSize: { xs: "2rem", sm: "2.5rem" },
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  Menu
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>
                  Search dishes, add them to the cart, and keep the order flow moving.
                </Typography>
              </Box>

              <Stack
                component="form"
                action="/"
                direction="row"
                spacing={1}
                sx={{ width: "100%", maxWidth: { md: 460 } }}
              >
                <TextField
                  fullWidth
                  defaultValue={query}
                  name="q"
                  placeholder="Search food by name"
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button type="submit" variant="contained">
                  Search
                </Button>
                <IconButton
                  aria-label="Track order"
                  component={Link}
                  href="/orders"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <TravelExploreIcon />
                </IconButton>
                <IconButton
                  aria-label="Open cart"
                  color="primary"
                  onClick={() => setCartOpen(true)}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Badge badgeContent={cartCount} color="primary">
                    <ShoppingBagIcon />
                  </Badge>
                </IconButton>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
            >
              <Typography color="text.secondary" variant="body2">
                {resultLabel}
              </Typography>
              {query ? (
                <Button component={Link} href="/" size="small" variant="text">
                  Clear search
                </Button>
              ) : null}
            </Stack>

            {items.length > 0 ? (
              <MenuGrid items={items} />
            ) : (
              <Alert severity="info" variant="outlined">
                No food items found. Try another name or clear the search to view the full menu.
              </Alert>
            )}
          </Stack>
        </Container>
      </Box>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
