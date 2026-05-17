import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: OrderRouteContext) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order", error);

    return NextResponse.json(
      { error: "Failed to fetch order." },
      { status: 500 }
    );
  }
}
