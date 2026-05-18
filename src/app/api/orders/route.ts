import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/schemas/order-schema";
import { type Prisma } from "@/generated/prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const orderItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = orderSchema.extend({
  items: z.array(orderItemSchema).min(1, "At least one item is required."),
});

const searchableStatuses = [
  "ORDER_RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function getOrderSearchWhere(query: string): Prisma.OrderWhereInput | undefined {
  if (!query) {
    return undefined;
  }

  const statusMatches = searchableStatuses.filter((status) =>
    status.replaceAll("_", " ").toLowerCase().includes(query.toLowerCase())
  );
  const numericQuery = Number(query);
  const orFilters: Prisma.OrderWhereInput[] = [
    {
      customer: {
        contains: query,
        mode: "insensitive",
      },
    },
    {
      phone: {
        contains: query,
        mode: "insensitive",
      },
    },
    {
      address: {
        contains: query,
        mode: "insensitive",
      },
    },
    {
      status: {
        contains: query,
        mode: "insensitive",
      },
    },
    {
      items: {
        some: {
          menuItem: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
    },
  ];

  if (Number.isInteger(numericQuery) && numericQuery > 0) {
    orFilters.push({ id: numericQuery });
  }

  if (statusMatches.length > 0) {
    orFilters.push({
      status: {
        in: statusMatches,
      },
    });
  }

  return {
    OR: orFilters,
  };
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    const orders = await prisma.order.findMany({
      where: getOrderSearchWhere(query),
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders", error);

    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid order payload.", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { customer, address, phone, items } = result.data;
    const itemQuantities = new Map<number, number>();

    for (const item of items) {
      itemQuantities.set(
        item.menuItemId,
        (itemQuantities.get(item.menuItemId) ?? 0) + item.quantity
      );
    }

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: [...itemQuantities.keys()],
        },
      },
    });

    if (menuItems.length !== itemQuantities.size) {
      return NextResponse.json(
        { error: "One or more menu items do not exist." },
        { status: 404 }
      );
    }

    const total = menuItems.reduce((sum, menuItem) => {
      return sum + menuItem.price * (itemQuantities.get(menuItem.id) ?? 0);
    }, 0);

    const order = await prisma.order.create({
      data: {
        customer,
        address,
        phone,
        total,
        status: "ORDER_RECEIVED",
        items: {
          create: menuItems.map((menuItem) => ({
            menuItemId: menuItem.id,
            quantity: itemQuantities.get(menuItem.id) ?? 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order", error);

    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}
