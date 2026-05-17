"use client";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LoadingButton from "@mui/material/Button";
import { Alert, Button, Stack, TextField } from "@mui/material";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { orderSchema } from "@/schemas/order-schema";
import { useCartStore } from "@/store/cart-store";

type CheckoutFormProps = {
  onOrderCreated?: (orderId: number) => void;
};

type CheckoutFormValues = z.infer<typeof orderSchema>;

export function CheckoutForm({ onOrderCreated }: CheckoutFormProps) {
  const { items, clearCart } = useCartStore();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: "",
      address: "",
      phone: "",
    },
  });

  const submitOrder = handleSubmit(async (values) => {
    setError("");
    setSuccess("");
    setCreatedOrderId(null);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    if (!response.ok) {
      setError("We could not place this order. Please check the details and try again.");
      return;
    }

    const order = (await response.json()) as { id: number };
    clearCart();
    reset();
    setCreatedOrderId(order.id);
    setSuccess(`Order #${order.id} placed successfully.`);
    onOrderCreated?.(order.id);
  });

  return (
    <Stack component="form" spacing={1.5} onSubmit={submitOrder}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? (
        <Alert
          severity="success"
          action={
            createdOrderId ? (
              <Button component={Link} href={`/orders/${createdOrderId}`} color="inherit" size="small">
                Track
              </Button>
            ) : null
          }
        >
          {success}
        </Alert>
      ) : null}
      <TextField
        label="Customer name"
        size="small"
        error={Boolean(errors.customer)}
        helperText={errors.customer?.message}
        {...register("customer")}
      />
      <TextField
        label="Phone number"
        size="small"
        error={Boolean(errors.phone)}
        helperText={errors.phone?.message}
        {...register("phone")}
      />
      <TextField
        label="Delivery address"
        multiline
        minRows={3}
        error={Boolean(errors.address)}
        helperText={errors.address?.message}
        {...register("address")}
      />
      <LoadingButton
        loading={isSubmitting}
        loadingPosition="start"
        startIcon={<CheckCircleOutlinedIcon />}
        type="submit"
        variant="contained"
        disabled={items.length === 0}
      >
        Place order
      </LoadingButton>
    </Stack>
  );
}
