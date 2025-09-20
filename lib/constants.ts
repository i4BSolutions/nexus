export const PERMISSION_KEYS = [
  "can_view_purchase_orders",
  "can_manage_purchase_orders",
  "can_view_invoices",
  "can_manage_invoices",
  "can_view_products_suppliers",
  "can_manage_products_suppliers",
  "can_view_stock",
  "can_stock_in",
  "can_stock_out",
  "can_view_warehouses",
  "can_manage_warehouses",
  "can_view_budgets_allocations",
  "can_manage_budgets_allocations",
  "can_view_dashboard",
  "can_manage_users",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];
