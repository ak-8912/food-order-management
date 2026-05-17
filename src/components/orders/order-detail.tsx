"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { normalizeOrderStatus } from "@/lib/order-status";
import { OrderStatus } from "./order-status";

type OrderDetailItem = {
  id: number;
  quantity: number;
  menuItem: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
};

export type OrderDetailData = {
  id: number;
  customer: string;
  address: string;
  phone: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderDetailItem[];
};

type OrderDetailProps = {
  order: OrderDetailData;
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

export function OrderDetail({ order }: OrderDetailProps) {
  const [liveOrder, setLiveOrder] = useState({
    ...order,
    status: normalizeOrderStatus(order.status),
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const eventSource = new EventSource(`/api/orders/${order.id}/events`);

    eventSource.addEventListener("status", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as {
        status: string;
      };

      setLiveOrder((currentOrder) => ({
        ...currentOrder,
        status: normalizeOrderStatus(payload.status),
      }));
    });

    return () => {
      eventSource.close();
    };
  }, [order.id]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Stack spacing={3} sx={{ mx: "auto", maxWidth: 960 }}>
        <Button
          component={Link}
          href="/orders"
          startIcon={<ArrowBackIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Track another order
        </Button>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "stretch", md: "flex-start" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography color="primary" sx={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>
              Order tracking
            </Typography>
            <Typography component="h1" variant="h3" sx={{ mt: 1, fontWeight: 800 }}>
              Order #{liveOrder.id}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Placed on {dateFormatter.format(new Date(liveOrder.createdAt))}
            </Typography>
          </Box>
          <Chip
            color={liveOrder.status === "DELIVERED" ? "success" : "primary"}
            label={statusLabels[liveOrder.status] ?? liveOrder.status}
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          />
        </Stack>

        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <Alert severity="info" variant="outlined">
                Status updates stream live while this page is open.
              </Alert>
              <OrderStatus status={liveOrder.status} orientation={isMobile ? "vertical" : "horizontal"} />
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Card elevation={0} sx={{ flex: 1, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>
                Customer details
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                <Typography>{liveOrder.customer}</Typography>
                <Typography color="text.secondary">{liveOrder.phone}</Typography>
                <Typography color="text.secondary">{liveOrder.address}</Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ flex: 1.3, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>
                Ordered items
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={2} sx={{ mt: 2 }}>
                {liveOrder.items.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar
                      alt={item.menuItem.name}
                      src={item.menuItem.image}
                      variant="rounded"
                      sx={{ width: 56, height: 56, borderRadius: 1 }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ fontWeight: 700 }}>
                        {item.menuItem.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Qty {item.quantity} x {currencyFormatter.format(item.menuItem.price)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800 }}>
                      {currencyFormatter.format(item.quantity * item.menuItem.price)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {currencyFormatter.format(liveOrder.total)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
