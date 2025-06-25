import { z } from "zod";

export const productFormSchema = z.object({
  sku: z.string().min(1, "SKU is required").optional(), // Required when create
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  currency_code: z.string().min(1, "Currency is required"),
  min_stock: z.number().min(0),
  description: z.string().optional(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
