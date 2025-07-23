export interface WarehouseInterface {
  id: number;
  name: string;
  location: string;
  capacity: number;
  total_items: number;
  total_amount: number;
}

export interface WarehouseResponse {
  items: WarehouseInterface[];
  total: number;
  page: number;
  pageSize: number;
}
