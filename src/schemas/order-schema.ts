import { z } from "zod";

export const orderSchema = z.object({
  customer: z.string().min(3),
  address: z.string().min(5),
  phone: z.string().min(10),
});
