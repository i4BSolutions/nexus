import { z } from "zod";

export const productFormInputSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1, "Name is required").max(255).trim(),
  category: z.string().min(1, "Category is required"),
  currency_code_id: z.string().min(1, "Currency is required"),
  unit_price: z
    .number({ required_error: "Unit price is required" })
    .gt(0, "Unit price must be greater than 0"),
  min_stock: z
    .number()
    .min(1, "Min stock level is required")
    .int()
    .nonnegative("Must be a valid stock count"),
  reason: z.string().optional(),
  description: z.string().optional(),
});

export type ProductFormInput = z.infer<typeof productFormInputSchema>;
