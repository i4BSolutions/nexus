export interface UserDetailResponse {
  full_name: string;
  username: string;
  email: string;
  department: {
    id: number;
    name: string;
  };
  permissions: {
    can_read_purchase_orders: boolean;
    can_manage_purchase_orders: boolean;
    can_read_invoices: boolean;
    can_manage_invoices: boolean;
    can_read_products_suppliers: boolean;
    can_manage_products_suppliers: boolean;
    can_read_stock: boolean;
    can_stock_in: boolean;
    can_stock_out: boolean;
    can_read_warehouses: boolean;
    can_manage_warehouses: boolean;
    can_read_budget_allocations: boolean;
    can_manage_budget_allocations: boolean;
    can_read_dashboard: boolean;
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
