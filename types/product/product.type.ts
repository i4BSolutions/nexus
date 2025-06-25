export interface ProductInterface {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  min_stock: number;
  stock: number;
  currency_code: string;
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
