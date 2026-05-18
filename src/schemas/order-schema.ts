import { z } from "zod";

export const orderSchema = z.object({
  customer: z
    .string()
    .trim()
    .min(1, "Please enter the customer's name.")
    .min(3, "Customer name should be at least 3 characters."),
  address: z
    .string()
    .trim()
    .min(1, "Please enter a delivery address.")
    .min(5, "Delivery address should be at least 5 characters."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter a phone number.")
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
});
