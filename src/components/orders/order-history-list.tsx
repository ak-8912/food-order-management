"use client";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { normalizeOrderStatus } from "@/lib/order-status";

type OrderHistoryItem = {
  id: number;
  customer: string;
  phone: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: number;
    quantity: number;
    menuItem: {
      name: string;
      image: string;
    };
  }[];
};

type OrderHistoryListProps = {
  initialOrders: OrderHistoryItem[];
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabels: Record<string, string> = {
  ORDER_RECEIVED: "Order Received",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

async function fetchOrders(query: string, signal: AbortSignal) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  const response = await fetch(`/api/orders?${searchParams.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders.");
  }

  return (await response.json()) as OrderHistoryItem[];
}

export function OrderHistoryList({ initialOrders }: OrderHistoryListProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim());
  const ordersQuery = useQuery({
    queryKey: ["orders", debouncedQuery],
    queryFn: ({ signal }) => fetchOrders(debouncedQuery, signal),
    initialData: debouncedQuery ? undefined : initialOrders,
    placeholderData: (previousData) => previousData,
  });
  const orders = ordersQuery.data ?? [];

  if (!debouncedQuery && orders.length === 0 && !ordersQuery.isFetching) {
    return (
      <Card elevation={0} sx={{ border: "1px dashed", borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
          <ReceiptLongIcon color="disabled" sx={{ fontSize: 44 }} />
          <Typography component="h2" variant="h6" sx={{ mt: 1, fontWeight: 800 }}>
            No orders yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Placed orders will appear here automatically.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2.5}>
      <TextField
        fullWidth
        label="Search order history"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, phone, item, status, or order number"
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

      {ordersQuery.isFetching ? (
        <Typography color="text.secondary" variant="body2">
          Searching orders...
        </Typography>
      ) : null}

      {ordersQuery.isError ? (
        <Alert severity="error" variant="outlined">
          We could not load orders. Please try again.
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        {orders.map((order) => {
          const status = normalizeOrderStatus(order.status);
          const firstItem = order.items[0];
          const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);

          return (
            <Card key={order.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardActionArea component={Link} href={`/orders/${order.id}`}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{
                      alignItems: { xs: "stretch", sm: "center" },
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, alignItems: "center" }}>
                      <Avatar
                        alt={firstItem?.menuItem.name ?? "Order"}
                        src={firstItem?.menuItem.image}
                        variant="rounded"
                        sx={{ width: 64, height: 64, borderRadius: 1 }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ flexWrap: "wrap", alignItems: "center" }}
                        >
                          <Typography component="h2" sx={{ fontWeight: 800 }}>
                            Order #{order.id}
                          </Typography>
                          <Chip
                            color={status === "DELIVERED" ? "success" : "primary"}
                            label={statusLabels[status] ?? status}
                            size="small"
                          />
                        </Stack>
                        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                          {order.customer} • {totalItems} item{totalItems === 1 ? "" : "s"}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {dateFormatter.format(new Date(order.createdAt))}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}>
                      <Typography sx={{ fontWeight: 800 }}>
                        {currencyFormatter.format(order.total)}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Tap to view status
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>

      {!ordersQuery.isError && orders.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          No orders match your search.
        </Typography>
      ) : null}
    </Stack>
  );
}
