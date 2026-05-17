export const ORDER_STATUS_FLOW = [
  "ORDER_RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_FLOW)[number] | "CANCELLED";

const legacyStatusMap: Record<string, OrderStatusValue> = {
  PENDING: "ORDER_RECEIVED",
  READY: "OUT_FOR_DELIVERY",
};

export function normalizeOrderStatus(status: string): OrderStatusValue {
  return legacyStatusMap[status] ?? (status as OrderStatusValue);
}

export function getOrderStatusIndex(status: string) {
  return ORDER_STATUS_FLOW.indexOf(normalizeOrderStatus(status) as (typeof ORDER_STATUS_FLOW)[number]);
}
