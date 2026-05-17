import { notFound } from "next/navigation";
import { OrderDetail, type OrderDetailData } from "@/components/orders/order-detail";
import { prisma } from "@/lib/prisma";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
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
    notFound();
  }

  const orderView: OrderDetailData = {
    ...order,
    createdAt: order.createdAt.toISOString(),
  };

  return <OrderDetail order={orderView} />;
}
