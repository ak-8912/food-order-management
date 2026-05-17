"use client";

import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { useCartStore } from "@/store/cart-store";
import { CartItem } from "./cart-item";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [completedOrderId, setCompletedOrderId] = useState<number | null>(null);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function handleClose() {
    setCompletedOrderId(null);
    onClose();
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 430 },
            maxWidth: "100vw",
          },
        },
      }}
    >
      <Stack sx={{ minHeight: "100%", p: { xs: 2, sm: 3 } }} spacing={2.5}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
              Cart
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {items.length} item{items.length === 1 ? "" : "s"} selected
            </Typography>
          </Box>
          <IconButton aria-label="Close cart" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider />

        {completedOrderId ? (
          <Stack spacing={2}>
            <Alert severity="success" variant="outlined">
              Order #{completedOrderId} has been placed successfully.
            </Alert>
            <Button component={Link} href={`/orders/${completedOrderId}`} variant="contained" onClick={handleClose}>
              Track order status
            </Button>
            <Button component={Link} href="/" color="secondary" variant="outlined" onClick={handleClose}>
              Continue browsing
            </Button>
          </Stack>
        ) : items.length > 0 ? (
          <>
            <Stack spacing={2}>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onQuantityChange={updateQuantity}
                />
              ))}
            </Stack>

            <Divider />

            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {currencyFormatter.format(subtotal)}
              </Typography>
            </Stack>

            <CheckoutForm onOrderCreated={setCompletedOrderId} />

            <Button color="secondary" variant="outlined" onClick={clearCart}>
              Clear cart
            </Button>
          </>
        ) : (
          <Alert icon={<ShoppingCartCheckoutIcon />} severity="info" variant="outlined">
            Your cart is empty. Add a dish from the menu to begin checkout.
          </Alert>
        )}
      </Stack>
    </Drawer>
  );
}
