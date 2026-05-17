import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/schemas/order-schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const orderItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = orderSchema.extend({
  items: z.array(orderItemSchema).min(1, "At least one item is required."),
});

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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
