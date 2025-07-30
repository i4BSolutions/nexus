export interface InventoryInterface {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    sku: string;
  };
  created_at: string;
}

export interface InventoryListInterface {
  sku: string;
  name: string;
  warehouse: string;
  current_stock: number;
  unit_price: number;
  total_value: number;
}
