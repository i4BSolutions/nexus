export interface Budget {
  id: number;
  budget_name: string;
  project_name: string;
  start_date: string;
  end_date: string;
  currency_code: string;
  exchange_rate_usd: number;
  planned_amount: number;
  planned_amount_usd: number;
  status: "Active" | "Inactive";
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetsResponse {
  items: Budget[];
  total: number;
  page: number;
  pageSize: number;
  statistics: {
    total: number;
    active: number;
    inactive: number;
  };
}
