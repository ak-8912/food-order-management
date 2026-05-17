"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Avatar, Box, IconButton, Stack, Typography } from "@mui/material";
import type { CartItem as CartItemType } from "@/store/cart-store";
import { QuantitySelector } from "./quantity-selector";

type CartItemProps = {
  item: CartItemType;
  onRemove: (id: number) => void;
  onQuantityChange: (id: number, quantity: number) => void;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function CartItem({ item, onRemove, onQuantityChange }: CartItemProps) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      <Avatar
        alt={item.name}
        src={item.image}
        variant="rounded"
        sx={{ width: 64, height: 64, borderRadius: 1 }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700 }}>
          {item.name}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {currencyFormatter.format(item.price)} each
        </Typography>
        <Typography color="text.primary" variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
          {currencyFormatter.format(item.price * item.quantity)}
        </Typography>
      </Box>
      <Stack spacing={0.75} sx={{ alignItems: "flex-end" }}>
        <IconButton aria-label={`Remove ${item.name}`} size="small" onClick={() => onRemove(item.id)}>
          <DeleteOutlinedIcon fontSize="small" />
        </IconButton>
        <QuantitySelector
          value={item.quantity}
          onChange={(quantity) => onQuantityChange(item.id, quantity)}
        />
      </Stack>
    </Stack>
  );
}
