export interface ProductInterface {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  min_stock: number;
  stock: number;
  currency_code_id: number;
  description: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  current_stock: number;
}

export interface ProductCurrencyInterface {
  id: number;
  currency_code: string;
  currency_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductResponse {
  items: ProductInterface[];
  total: number;
  page: number;
  pageSize: number;
  counts: { total: number; lowStock: number; outOfStock: number };
}

// version 0 product price history type
export interface ProductPriceHistoryInterface {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  reason: string;
  updated_by: string;
  created_at: string;
}

// version 0 product price history type
export interface ProductPriceHistoryResponse {
  items: ProductPriceHistoryInterface[];
}

// version 1 product price history type
export interface ProductHistory {
  id: number;
  product_id: number;
  changed_at: string;
  changed_by: string;
  changed_field: string;
  new_values: string;
  old_values: string;
  user_profiles: {
    full_name: string;
  };
}

export interface ProductHistoryPaginatedResponse {
  items: ProductHistory[];
  pagination: {
    totalPages: number;
    page: number;
    pageSize: number;
  };
}

export interface LastStockMovement {
  date: string | undefined;
  type: "IN" | "OUT" | undefined;
  quantity: number | undefined;
  invoice_id: number | undefined;
  processed_by: string | undefined;
  warehouse_name: string | undefined;
}

export interface ProductPurchaseOrder {
  purchase_order_no: string;
  supplier_name: string;
  order_date: string;
  quantity: number;
  unit_price: string;
  amount: string;
  amount_usd: string;
  status: string;
}

export interface ProductUsageHistory {
  product_id: number;
  current_stock: number;
  minimum_stock: number;
  last_stock_movement: LastStockMovement | null;
  purchase_orders: ProductPurchaseOrder[];
  page?: number;
  pageSize?: number;
  total?: number;
}
