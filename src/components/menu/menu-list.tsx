"use client";

import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { useQuery } from "@tanstack/react-query";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useCartStore } from "@/store/cart-store";
import { MenuGrid } from "./menu-grid";
import type { MenuItemView } from "./menu-card";

type MenuListProps = {
  initialItems: MenuItemView[];
  initialQuery?: string;
};

async function fetchMenu(query: string, signal: AbortSignal) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  const response = await fetch(`/api/menu?${searchParams.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch menu items.");
  }

  return (await response.json()) as MenuItemView[];
}

export function MenuList({ initialItems, initialQuery = "" }: MenuListProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query.trim());
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const menuQuery = useQuery({
    queryKey: ["menu", debouncedQuery],
    queryFn: ({ signal }) => fetchMenu(debouncedQuery, signal),
    initialData: debouncedQuery === initialQuery ? initialItems : undefined,
    placeholderData: (previousData) => previousData,
  });
  const items = menuQuery.data ?? [];

  const resultLabel = useMemo(() => {
    const count = `${items.length} item${items.length === 1 ? "" : "s"}`;
    return debouncedQuery ? `${count} matching "${debouncedQuery}"` : count;
  }, [debouncedQuery, items.length]);

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
                direction="row"
                spacing={1}
                sx={{ width: "100%", maxWidth: { md: 460 } }}
              >
                <TextField
                  fullWidth
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
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
                {menuQuery.isFetching ? "Searching..." : resultLabel}
              </Typography>
              {query ? (
                <Button onClick={() => setQuery("")} size="small" variant="text">
                  Clear search
                </Button>
              ) : null}
            </Stack>

            {menuQuery.isError ? (
              <Alert severity="error" variant="outlined">
                We could not load the menu. Please try again.
              </Alert>
            ) : items.length > 0 ? (
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
