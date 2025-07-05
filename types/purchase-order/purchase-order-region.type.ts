export interface PurchaseOrderRegionInterface {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderRegionsResponse {
  items: PurchaseOrderRegionInterface[];
}
