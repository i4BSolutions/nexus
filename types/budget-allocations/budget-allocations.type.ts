export interface BudgetAllocationsInterface {
  id: number;
  po_id: number;
  budget_id: number;
  allocation_number: string;
  allocation_date: string;
  allocation_amount: number;
  allocated_by: string;
  currency_code: string;
  exchange_rate_usd: number;
  equivalent_usd: number;
  transfer_evidence: string;
  transfer_evidence_url?: string;
  status: string;
  note?: string;
  created_at: string;
  updated_at: string;
  transfer_evidence_urls?: Array<{ key: string; url: string | null }>;
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
  po_id: number;
  allocation_number: string;
  allocation_date: string;
  allocation_amount: number;
  currency_code: string;
  exchange_rate_usd: number;
  transfer_evidence?: string | string[];
  note?: string;
  allocated_by: string;
}
