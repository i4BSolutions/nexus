export interface UserDetailResponse {
  id: string;
  full_name: string;
  username: string;
  email: string;
  department: {
    id: number;
    name: string;
  };
  permissions: {
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
  login_audit_log?: {
    id: number;
    ip_address: string;
    city: string;
    country: string;
    device: string;
    browser: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
}
