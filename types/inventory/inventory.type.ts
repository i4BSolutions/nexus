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
