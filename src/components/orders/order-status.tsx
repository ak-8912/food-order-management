"use client";

import { Alert, Chip, Step, StepLabel, Stepper } from "@mui/material";

export type OrderStatusValue =
  | "ORDER_RECEIVED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

type OrderStatusProps = {
  status: OrderStatusValue | string;
  orientation?: "horizontal" | "vertical";
};

const steps: OrderStatusValue[] = [
  "ORDER_RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const statusLabels: Record<OrderStatusValue, string> = {
  ORDER_RECEIVED: "Order Received",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrderStatus({ status, orientation = "horizontal" }: OrderStatusProps) {
  if (status === "CANCELLED") {
    return (
      <Alert
        severity="warning"
        action={<Chip color="warning" label={statusLabels.CANCELLED} size="small" />}
      >
        This order has been cancelled.
      </Alert>
    );
  }

  const activeStep = Math.max(
    0,
    steps.findIndex((step) => step === status)
  );

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel={orientation === "horizontal"}
      orientation={orientation}
      sx={{ width: "100%" }}
    >
      {steps.map((step) => (
        <Step key={step} completed={activeStep > steps.indexOf(step)}>
          <StepLabel
            optional={
              step === status ? (
                <Chip color="primary" label="Current" size="small" sx={{ mt: 0.75 }} />
              ) : null
            }
          >
            {statusLabels[step]}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
