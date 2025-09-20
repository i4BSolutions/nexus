export type UserFieldType = {
  full_name: string;
  username: string;
  email: string;
  department: string;
  can_view_purchase_orders: boolean;
  can_manage_purchase_orders: boolean;
  can_view_invoices: boolean;
  can_manage_invoices: boolean;
  can_view_products_suppliers: boolean;
  can_manage_products_suppliers: boolean;
  can_view_stock: boolean;
  can_stock_in: boolean;
  can_stock_out: boolean;
  can_view_warehouses: boolean;
  can_manage_warehouses: boolean;
  can_view_budgets_allocations: boolean;
  can_manage_budgets_allocations: boolean;
  can_view_dashboard: boolean;
  can_manage_users: boolean;
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
