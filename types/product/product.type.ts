export interface ProductInterface {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit_price: number;
  min_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
