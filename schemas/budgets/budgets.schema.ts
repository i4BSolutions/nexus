import { z } from "zod";

export const BudgetSchema = z.object({
  budget_name: z.string().min(1, "Budget name is required"),
  project_name: z.string().min(1, "Project name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  currency_code: z.string().min(1, "Currency is required"),
  exchange_rate_usd: z.number().positive("Exchange rate must be > 0"),
  planned_amount: z.number().positive("Planned amount must be > 0"),
  planned_amount_usd: z.number().positive("Planned amount usd must be > 0"),
  status: z.enum(["Active", "Inactive"]),
  description: z.string().optional(),
});

export type BudgetFormInput = z.infer<typeof BudgetSchema>;
