"use client";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Image from "next/image";
import {
  Box,
  Button,
  Chip,
  ImageList,
  ImageListItem,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useCartStore } from "@/store/cart-store";
import type { MenuItemView } from "./menu-card";

type MenuGridProps = {
  items: MenuItemView[];
};

type MenuImageListItemProps = {
  item: MenuItemView;
  index: number;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function MenuImageListItem({ item, index }: MenuImageListItemProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { ref, isVisible } = useScrollReveal<HTMLLIElement>();
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const imageLoaded = loadedImage === item.image;

  return (
    <ImageListItem
      ref={ref}
      sx={{
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) scale(1)"
          : "translateY(18px) scale(0.985)",
        transition:
          "opacity 420ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        transitionDelay: isVisible ? `${Math.min(index * 45, 220)}ms` : "0ms",
        willChange: "opacity, transform",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 2,
          transform: isVisible
            ? "translateY(-3px) scale(1)"
            : "translateY(18px) scale(0.985)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: {
            xs: "clamp(210px, 62vw, 320px)",
            sm: "clamp(220px, 34vw, 340px)",
            lg: "clamp(230px, 22vw, 360px)",
          },
          overflow: "hidden",
          bgcolor: "grey.100",
        }}
      >
        {!imageLoaded ? (
          <Skeleton
            animation="wave"
            height="100%"
            variant="rectangular"
            width="100%"
            sx={{
              position: "absolute",
              inset: 0,
              transform: "none",
              zIndex: 0,
            }}
          />
        ) : null}
        <Image
          alt={item.name}
          fill
          onLoad={() => setLoadedImage(item.image)}
          onError={() => setLoadedImage(item.image)}
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={item.image}
          style={{
            objectFit: "cover",
            opacity: 1,
            transform: imageLoaded ? "scale(1)" : "scale(1.025)",
            transition: "opacity 260ms ease, transform 360ms ease",
          }}
        />
      </Box>

      <Stack spacing={1.5} sx={{ p: 2 }}>
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
          noWrap
        >
          {item.description}
        </Typography>
        <Button
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          variant="contained"
          onClick={() => addItem(item)}
        >
          Add to cart
        </Button>
      </Stack>
    </ImageListItem>
  );
}

export function MenuGrid({ items }: MenuGridProps) {
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
  const isSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const columns = isLarge ? 3 : isSmall ? 2 : 1;

  return (
    <ImageList
      cols={columns}
      gap={20}
      rowHeight="auto"
      sx={{ m: 0, overflow: "visible" }}
    >
      {items.map((item, index) => (
        <MenuImageListItem key={item.id} item={item} index={index} />
      ))}
    </ImageList>
  );
}
