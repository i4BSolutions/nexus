import { z } from "zod";

export const createCategorySchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
});

export type CreateCategoryFormSchema = z.infer<typeof createCategorySchema>;
