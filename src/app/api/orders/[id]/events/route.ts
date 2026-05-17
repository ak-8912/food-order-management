import {
  getOrderStatusIndex,
  normalizeOrderStatus,
  ORDER_STATUS_FLOW,
} from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderEventsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const encoder = new TextEncoder();

function encodeSseMessage(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request, context: OrderEventsRouteContext) {
  const { id } = await context.params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return new Response("Invalid order id.", { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!order) {
    return new Response("Order not found.", { status: 404 });
  }

  const existingOrder = order;
  let cleanupStream = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      let closed = false;
      const heartbeat = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }
      }, 15000);

      function cleanup() {
        closed = true;
        clearInterval(heartbeat);
        for (const timeout of timeouts) {
          clearTimeout(timeout);
        }
      }

      cleanupStream = cleanup;

      async function emitStatus(status: string) {
        if (closed) {
          return;
        }

        await prisma.order.update({
          where: {
            id: existingOrder.id,
          },
          data: {
            status,
          },
        });

        if (!closed) {
          controller.enqueue(
            encodeSseMessage("status", {
              orderId: existingOrder.id,
              status,
            })
          );
        }
      }

      const normalizedStatus = normalizeOrderStatus(existingOrder.status);

      if (normalizedStatus === "CANCELLED") {
        controller.enqueue(
          encodeSseMessage("status", {
            orderId: existingOrder.id,
            status: normalizedStatus,
          })
        );
        return;
      }

      const currentStatusIndex = Math.max(0, getOrderStatusIndex(normalizedStatus));
      const remainingStatuses = ORDER_STATUS_FLOW.slice(currentStatusIndex);

      remainingStatuses.forEach((status, index) => {
        const timeout = setTimeout(() => {
          void emitStatus(status);
        }, index * 5000);

        timeouts.push(timeout);
      });

      request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // The stream may already be closed by the browser.
        }
      });
    },
    cancel() {
      cleanupStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
