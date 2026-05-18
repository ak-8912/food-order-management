import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderHistoryList } from "@/components/orders/order-history-list";

const orders = [
  {
    id: 10,
    customer: "Akhil Chovatiya",
    phone: "9876543210",
    total: 498,
    status: "ORDER_RECEIVED",
    createdAt: "2026-05-18T10:00:00.000Z",
    items: [
      {
        id: 1,
        quantity: 2,
        menuItem: {
          name: "Veg Burger",
          image: "/food/burger.jpg",
        },
      },
    ],
  },
];

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 60 * 1000,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe("OrderHistoryList", () => {
  it("renders order summary cards", () => {
    renderWithQueryClient(<OrderHistoryList initialOrders={orders} />);

    expect(screen.getByText("Order #10")).toBeInTheDocument();
    expect(screen.getByText("Order Received")).toBeInTheDocument();
    expect(screen.getByText(/Akhil Chovatiya/)).toBeInTheDocument();
    expect(screen.getByText("₹498")).toBeInTheDocument();
  });

  it("renders the empty state when no orders exist", () => {
    renderWithQueryClient(<OrderHistoryList initialOrders={[]} />);

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(screen.getByText("Placed orders will appear here automatically.")).toBeInTheDocument();
  });
});
