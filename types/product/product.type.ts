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

export interface ProductPriceHistoryInterface {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  reason: string;
  updated_by: string;
  created_at: string;
}

export interface ProductPriceHistoryResponse {
  items: ProductPriceHistoryInterface[];
}
