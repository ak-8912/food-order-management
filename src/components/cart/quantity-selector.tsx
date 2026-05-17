"use client";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton, Stack, Typography } from "@mui/material";

type QuantitySelectorProps = {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
};

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        alignItems: "center",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 0.25,
      }}
    >
      <IconButton
        aria-label="Decrease quantity"
        disabled={value <= min}
        size="small"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography
        aria-live="polite"
        component="span"
        sx={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}
      >
        {value}
      </Typography>
      <IconButton
        aria-label="Increase quantity"
        disabled={value >= max}
        size="small"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
