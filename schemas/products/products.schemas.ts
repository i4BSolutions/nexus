import { z } from "zod";

export const productFormInputSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1).max(255).trim(),
  category: z.string().min(1, "Category is required"), // category_name
  currency_code_id: z.string().min(1, "Currency is required"),
  unit_price: z.string().refine((val) => !isNaN(parseFloat(val))),
  min_stock: z.string().refine((val) => Number.isInteger(Number(val))),
  reason: z.string().optional(),
  description: z.string().optional(),
});

export type ProductFormInput = z.infer<typeof productFormInputSchema>;
