export interface InventoryInterface {
  id: number;
  quantity: number;
  product: {
    name: string;
    sku: string;
  };
  created_at: string;
}
