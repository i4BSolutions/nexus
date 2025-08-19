export interface Budget {
  id: number;
  budget_name: string;
  project_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  currency_code: string;
  exchange_rate_usd: number;
  planned_amount: number;
  planned_amount_usd: number;
  status: boolean;
  allocated_variance_usd?: number;
  allocated_amount_usd?: number;
  invoiced_amount_usd?: number;
  allocation_percentage?: number;
  unutilized_amount_usd?: number;
  utilization_percentage?: number;
  po_count?: number;
  total_po_value_usd?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetAuditLog {
  id: number;
  budget_id: number;
  action: string;
  changes: string;
  ip_address: string;
  performed_by: string;
  created_at: string;
}

export interface BudgetResponse {
  items: Budget[];
  total: number;
  page: number;
  pageSize: number;
  statistics: {
    total: number;
    active: number;
    inactive: number;
    totalPlanned: number;
    totalAllocated: number;
    totalInvoiced: number;
    averageUtilization: number;
    invoicedVsAllocatedPercentage: number;
    allocatedVsPlannedPercentage: number;
  };
}

export interface BudgetStatistics {
  totalPlannedUSD: number; // Total planned budget amount in USD
  totalAllocatedUSD: number; // Total allocated budget amount in USD
  totalInvoicedUSD: number; // Total invoiced budget amount in USD
  allocationPercentage: number;
  invoiceUtilizationPercentage: number;
  averageUtilization: number;
}
