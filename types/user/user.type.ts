export type UserFieldType = {
  avatar?: string;
  full_name: string;
  username: string;
  email: string;
  department: string;
  view_purchase_orders: boolean;
  manage_purchase_orders: boolean;
  view_invoices: boolean;
  manage_invoices: boolean;
  view_products_suppliers: boolean;
  manage_products_suppliers: boolean;
  view_stock: boolean;
  stock_in: boolean;
  stock_out: boolean;
  view_warehouses: boolean;
  manage_warehouses: boolean;
  view_budgets_allocations: boolean;
  manage_budgets_allocations: boolean;
  view_dashboard: boolean;
  manage_users: boolean;
};

export type UserInterface = {
  id: string;
  email: string;
  full_name: string;
  username: string;
  department: {
    id: number;
    name: string;
  };
  created_at: string;
};

export type UsersResponse = {
  dto: UserInterface[];
  total: number;
  page: number;
  pageSize: number;
};

export type UserFilterParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  department?: number;
  search?: string;
};
