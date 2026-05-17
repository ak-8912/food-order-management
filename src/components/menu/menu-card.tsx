"use client";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import { useCartStore } from "@/store/cart-store";

export type MenuItemView = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

type MenuCardProps = {
  item: MenuItemView;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function MenuCard({ item }: MenuCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        transition: "border-color 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardMedia
        component="img"
        image={item.image}
        alt={item.name}
        sx={{
          aspectRatio: "4 / 3",
          bgcolor: "grey.100",
          objectFit: "cover",
        }}
      />
      <CardContent
        sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 1.5 }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Typography
            component="h2"
            variant="h6"
            sx={{ flex: 1, fontWeight: 700, lineHeight: 1.25 }}
          >
            {item.name}
          </Typography>
          <Chip
            color="secondary"
            label={currencyFormatter.format(item.price)}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ lineHeight: 1.7 }}
        >
          {item.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          variant="contained"
          onClick={() => addItem(item)}
        >
          Add to cart
        </Button>
      </CardActions>
    </Card>
  );
}
