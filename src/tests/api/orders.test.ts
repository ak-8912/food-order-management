import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    menuItem: {
      findMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

const sampleOrder = {
  id: 10,
  customer: "Akhil Chovatiya",
  address: "123 Food Street",
  phone: "9876543210",
  total: 498,
  status: "ORDER_RECEIVED",
  createdAt: new Date("2026-05-18T10:00:00.000Z"),
  items: [
    {
      id: 1,
      quantity: 2,
      menuItem: {
        id: 1,
        name: "Veg Burger",
        description: "Loaded veg burger",
        price: 199,
        image: "/food/burger.jpg",
      },
    },
  ],
};

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function routeContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

describe("orders API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists orders and passes search filters to Prisma", async () => {
    const { GET } = await import("@/app/api/orders/route");
    prismaMock.order.findMany.mockResolvedValueOnce([sampleOrder]);

    const response = await GET({
      nextUrl: new URL("http://localhost/api/orders?q=burger"),
    } as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              customer: { contains: "burger", mode: "insensitive" },
            }),
          ]),
        }),
      })
    );
  });

  it("creates an order, merges duplicate item quantities, and calculates totals", async () => {
    const { POST } = await import("@/app/api/orders/route");
    prismaMock.menuItem.findMany.mockResolvedValueOnce([
      { id: 1, name: "Veg Burger", price: 199 },
      { id: 2, name: "French Fries", price: 99 },
    ]);
    prismaMock.order.create.mockResolvedValueOnce(sampleOrder);

    const response = await POST(
      jsonRequest({
        customer: "Akhil Chovatiya",
        address: "123 Food Street",
        phone: "9876543210",
        items: [
          { menuItemId: 1, quantity: 1 },
          { menuItemId: 1, quantity: 1 },
          { menuItemId: 2, quantity: 1 },
        ],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe(sampleOrder.id);
    expect(prismaMock.menuItem.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [1, 2],
        },
      },
    });
    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: 497,
          items: {
            create: [
              { menuItemId: 1, quantity: 2 },
              { menuItemId: 2, quantity: 1 },
            ],
          },
        }),
      })
    );
  });

  it("rejects invalid order payloads", async () => {
    const { POST } = await import("@/app/api/orders/route");

    const response = await POST(
      jsonRequest({
        customer: "Ak",
        address: "123",
        phone: "123",
        items: [],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid order payload.");
    expect(prismaMock.order.create).not.toHaveBeenCalled();
  });

  it("returns 404 when creating with unknown menu items", async () => {
    const { POST } = await import("@/app/api/orders/route");
    prismaMock.menuItem.findMany.mockResolvedValueOnce([]);

    const response = await POST(
      jsonRequest({
        customer: "Akhil Chovatiya",
        address: "123 Food Street",
        phone: "9876543210",
        items: [{ menuItemId: 999, quantity: 1 }],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("One or more menu items do not exist.");
  });

  it("reads an order by id", async () => {
    const { GET } = await import("@/app/api/orders/[id]/route");
    prismaMock.order.findUnique.mockResolvedValueOnce(sampleOrder);

    const response = await GET(new Request("http://localhost"), routeContext("10"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe(10);
    expect(prismaMock.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
      })
    );
  });

  it("rejects invalid order ids while reading", async () => {
    const { GET } = await import("@/app/api/orders/[id]/route");

    const response = await GET(new Request("http://localhost"), routeContext("abc"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid order id.");
  });

  it("updates order status", async () => {
    const { PATCH } = await import("@/app/api/orders/[id]/status/route");
    prismaMock.order.update.mockResolvedValueOnce({
      ...sampleOrder,
      status: "PREPARING",
    });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ status: "PREPARING" }),
      }),
      routeContext("10")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("PREPARING");
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 10 },
        data: { status: "PREPARING" },
      })
    );
  });

  it("rejects invalid status updates", async () => {
    const { PATCH } = await import("@/app/api/orders/[id]/status/route");

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ status: "COOKED" }),
      }),
      routeContext("10")
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid status.");
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it("deletes an order and its order items", async () => {
    const { DELETE } = await import("@/app/api/orders/[id]/route");
    prismaMock.order.findUnique.mockResolvedValueOnce({ id: 10 });
    prismaMock.orderItem.deleteMany.mockReturnValueOnce({ kind: "delete-items" });
    prismaMock.order.delete.mockReturnValueOnce({ kind: "delete-order" });
    prismaMock.$transaction.mockResolvedValueOnce([]);

    const response = await DELETE(new Request("http://localhost"), routeContext("10"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(prismaMock.orderItem.deleteMany).toHaveBeenCalledWith({
      where: { orderId: 10 },
    });
    expect(prismaMock.order.delete).toHaveBeenCalledWith({
      where: { id: 10 },
    });
  });

  it("returns 404 when deleting a missing order", async () => {
    const { DELETE } = await import("@/app/api/orders/[id]/route");
    prismaMock.order.findUnique.mockResolvedValueOnce(null);

    const response = await DELETE(new Request("http://localhost"), routeContext("10"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Order not found.");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
