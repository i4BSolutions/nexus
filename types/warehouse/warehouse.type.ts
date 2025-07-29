export interface WarehouseInterface {
  id: number;
  name: string;
  location: string;
  capacity: number;
  total_items?: number;
  total_amount?: number;
}

export interface WarehouseResponse {
  items: WarehouseInterface[];
  total: number;
  page: number;
  pageSize: number;
}

export type WarehouseDetailsResponse = {
  warehouse: {
    id: number;
    name: string;
    location: string;
    capacity: number;
  };
  total_item_count: number;
  total_stock_value: number;
  stock_in: number;
  stock_out: number;
  inventory: WarehouseInventoryItem[];
  stock_movement_logs: StockMovementLog[];
  inventory_total: number;
  stock_movement_total: number;
};

export type WarehouseInventoryItem = {
  id: number;
  sku: string;
  name: string;
  category: string;
  current_stock: number;
  incoming: number;
  outgoing: number;
  total_value: number;
};

export type StockMovementLog = {
  id: number;
  date: string;
  time: string;
  sku: string;
  name: string;
  direction: "Stock In" | "Stock Out";
  quantity: number;
  reference: string;
};
