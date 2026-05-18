import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { connection } from "next/server";
import { OrderHistoryList } from "@/components/orders/order-history-list";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  await connection();

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const orderViews = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", sm: "flex-end" }, justifyContent: "space-between" }}
          >
            <Box>
              <Typography color="primary" sx={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>
                Order history
              </Typography>
              <Typography component="h1" variant="h3" sx={{ mt: 1, fontWeight: 800 }}>
                Track your orders
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>
                Choose any recent order to view its current preparation and delivery status.
              </Typography>
            </Box>
            <Button href="/" variant="contained" sx={{ alignSelf: { sm: "center" } }}>
              Browse menu
            </Button>
          </Stack>

          <OrderHistoryList initialOrders={orderViews} />
        </Stack>
      </Container>
    </Box>
  );
}
