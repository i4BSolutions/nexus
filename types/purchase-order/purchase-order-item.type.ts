export interface PurchaseOrderItemInterface {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  unit_price_local: number;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrderItemDetailInterface
  extends PurchaseOrderItemInterface {
  product?: {
    name: string;
    sku: string;
    description: string;
  };
}
