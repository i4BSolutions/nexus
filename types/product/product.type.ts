export interface ProductInterface {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  min_stock: number;
  stock: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
