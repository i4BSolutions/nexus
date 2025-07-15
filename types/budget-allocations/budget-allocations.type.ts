export interface BudgetAllocationsInterface {
  id: number;
  po_id: number;
  budget_id: number;
  allocation_number: string;
  allocation_date: string;
  allocation_amount: number;
  currency_code: string;
  exchange_rate_usd: number;
  equivalent_usd: number;
  transfer_evidence: string;
  status: "Pending" | "Paid" | "Canceled";
  created_at: string;
  updated_at: string;
}

export interface BudgetAllocationsResponse {
  items: BudgetAllocationsInterface[];
  total: number;
  page: number;
  pageSize: number;
  statistics: {
    totalAllocations: number;
    totalAllocatedUSD: number;
    totalPendingUSD: number;
  };
}

export interface BudgetAllocationsUpdateData {
  allocation_number: string;
  allocation_date: string;
  allocation_amount: number;
  currency_code: string;
  exchange_rate_usd: number;
  transfer_evidence?: string;
}
