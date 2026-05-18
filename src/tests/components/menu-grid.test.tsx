import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MenuGrid } from "@/components/menu/menu-grid";
import { useCartStore } from "@/store/cart-store";

const menuItems = [
  {
    id: 1,
    name: "Veg Burger",
    description: "Loaded veg burger",
    price: 199,
    image: "/food/burger.jpg",
  },
  {
    id: 2,
    name: "French Fries",
    description: "Crispy golden potato fries",
    price: 99,
    image: "/food/fries.jpg",
  },
];

describe("MenuGrid", () => {
  afterEach(() => {
    useCartStore.getState().clearCart();
  });

  it("renders menu images with descriptions below them", () => {
    render(<MenuGrid items={menuItems} />);

    expect(screen.getByRole("img", { name: "Veg Burger" })).toHaveAttribute(
      "src",
      "/food/burger.jpg"
    );
    expect(screen.getByText("Loaded veg burger")).toBeInTheDocument();
    expect(screen.getByText("₹199")).toBeInTheDocument();
  });

  it("adds menu items to the cart", () => {
    render(<MenuGrid items={menuItems} />);

    fireEvent.click(screen.getAllByRole("button", { name: /add to cart/i })[0]);

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        id: 1,
        name: "Veg Burger",
        quantity: 1,
      }),
    ]);
  });
});
