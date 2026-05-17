"use client";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import {
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
import { useMemo, useState } from "react";
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
  orders: OrderHistoryItem[];
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

export function OrderHistoryList({ orders }: OrderHistoryListProps) {
  const [query, setQuery] = useState("");

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) => {
      const searchableText = [
        order.id,
        order.customer,
        order.phone,
        order.status,
        ...order.items.map((item) => item.menuItem.name),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [orders, query]);

  if (orders.length === 0) {
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

      <Stack spacing={1.5}>
        {filteredOrders.map((order) => {
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

      {filteredOrders.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center" }}>
          No orders match your search.
        </Typography>
      ) : null}
    </Stack>
  );
}
