import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const statuses = ["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const;

const statusSchema = z.object({
  status: z.enum(statuses),
});

type StatusRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: StatusRouteContext) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: "Invalid order id." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = statusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid status.",
          allowedStatuses: statuses,
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: result.data.status,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    console.error("Failed to update order status", error);

    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 }
    );
  }
}
