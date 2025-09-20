export interface StockTransactionHistory {
  product_name: string;
  product_sku: string;
  invoice_number?: string;
  quantity: string;
  warehouse: string;
  date: string;
}

export interface StockTransactionInterface {
  id: number;
  date: string;
  time: string;
  sku: string;
  name: string;
  warehouse: string;
  direction: "Stock In" | "Stock Out";
  approved_by: string | null;
  approval_order_no: string | null;
  destination_warehouse: string | null;
  quantity: number;
  reference: string;
  note: string | null;
  is_voided: boolean;
  evidence: Array<{
    key: string;
    name?: string | null;
    mime?: string | null;
    size?: number | null;
    type?: string | null; // "photo" | "pdf"
    url: string;
  }>;
}

export interface StockTransactionInterfaceResponse {
  items: StockTransactionInterface[];
  total: number;
  page: number;
  pageSize: number;
}

export type StockTransactionFilterParams = {
  start_date?: string;
  end_date?: string;
  direction?: "All Directions" | "Stock In" | "Stock Out";
  warehouse?: string;
  product?: string;
  page?: number;
  pageSize?: number;
};
