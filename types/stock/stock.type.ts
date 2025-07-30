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
  quantity: number;
  reference: string;
  note: string | null;
}

export interface StockTransactionInterfaceResponse {
  items: StockTransactionInterface[];
  total: number;
  page: number;
  pageSize: number;
}
