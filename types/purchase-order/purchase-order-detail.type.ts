import { PurchaseOrderItemInterface } from "./purchase-order-item.type";

export interface PoInvoiceInterface {
  id: number;
  invoice_no: string;
  supplier: string;
  invoice_date: string;
  due_date: string;
  amount_local: number;
  amount_usd: number;
  currency_code: string;
  status: string;
}

export interface PurchaseOrderDetailDto {
  id: number;
  purchase_order_no: string;
  supplier: string;
  region: string;
  order_date: string;
  expected_delivery_date: string;
  budget: string;
  currency_code: string;
  usd_exchange_rate: number;
  product_items: PurchaseOrderItemInterface[];
  total_amount_local: number;
  total_amount_usd: number;
  contact_person: string;
  sign_person?: string;
  authorized_sign_person?: string;
  note?: string;
}

export interface PoBudgetAllocationInterface {
  id: number;
  budget_no: string;
  allocation_date: string;
  currency_code: string;
  allocated_amount_local: number;
  allocated_amount_usd: number;
  status: string;
}

export interface UsageHistoryDto {
  id: number;
  invoiceCoverage: {
    percent: number;
    totalAmount: number;
    totalInvoicedAmount: number;
    totalInvoices: number;
  };
  paymentStatus: {
    percentage: number;
    paid: number;
    remaining: number;
  };
  itemCoverage: {
    percentage: number;
    itemsInvoiced: number;
    itemsRemaining: number;
  };
  invoices: PoInvoiceInterface[];
  total_invoices: number;
  totalPoAmountLocal: number;
  totalPoAmountUsd: number;
  totalAllocatedAmountLocal: number;
  totalAllocatedAmountUsd: number;
  totalRemainingAmountLocal: number;
  totalRemainingAmountUsd: number;
  allocationProgressPercent: number;
  budgetAllocations: PoBudgetAllocationInterface[];
  total_budget_allocations: number;
}
