"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Button, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function OrderLookupForm() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedOrderId = Number(orderId);
    if (!Number.isInteger(normalizedOrderId) || normalizedOrderId <= 0) {
      setError("Enter a valid order number.");
      return;
    }

    router.push(`/orders/${normalizedOrderId}`);
  }

  return (
    <Stack
      component="form"
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      onSubmit={handleSubmit}
      sx={{ width: "100%" }}
    >
      <TextField
        fullWidth
        label="Order number"
        value={orderId}
        onChange={(event) => {
          setOrderId(event.target.value);
          setError("");
        }}
        error={Boolean(error)}
        helperText={error || "Use the order number shown after checkout."}
        inputMode="numeric"
      />
      <Button
        type="submit"
        size="large"
        startIcon={<SearchIcon />}
        variant="contained"
        sx={{ minWidth: { sm: 150 } }}
      >
        Track
      </Button>
    </Stack>
  );
}
