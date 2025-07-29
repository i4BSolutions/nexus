export interface UserDetailResponse {
  full_name: string;
  username: string;
  email: string;
  department: {
    id: number;
    name: string;
  };
  permissions: {
    view_purchase_orders: boolean;
    manage_purchase_orders: boolean;
    view_invoices: boolean;
    manage_invoices: boolean;
    view_products_suppliers: boolean;
    manage_products_suppliers: boolean;
    view_stock: boolean;
    manage_stock_in: boolean;
    manage_stock_out: boolean;
    view_warehouses: boolean;
    manage_warehouses: boolean;
    view_budgets_allocations: boolean;
    manage_budgets_allocations: boolean;
    view_dashboard: boolean;
    manage_users: boolean;
  };
  created_at: string;
  updated_at: string;
}
