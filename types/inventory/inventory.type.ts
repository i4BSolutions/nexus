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

export interface InventoryListResponse {
  items: InventoryListInterface[];
  total_item_count: number;
  total_inventory_value: number;
  total_rows: number;
}

export interface InventoryListInterface {
  id: number;
  sku: string;
  name: string;
  warehouse: string;
  current_stock: number;
  unit_price: number;
  total_value: number;
}

export interface InventoryResponse {
  items: InventoryResponseInterface[];
  total_item_count: number;
  total_inventory_value: number;
  total: number;
  page: number;
  pageSize: number;
}

export type InventoryListFilterParams = {
  // q = search
  q?: string;
  page?: number;
  pageSize?: number;
  warehouse?: string;
};