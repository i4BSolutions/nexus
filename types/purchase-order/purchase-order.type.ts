import { PurchaseOrderItemInterface } from "./purchase-order-item.type";

export interface PurchaseOrderInterface {
  id: number;
  purchase_order_no: string;
  supplier_id: number;
  region_id: number;
  budget_id: number;
  order_date: string;
  currency_id: number;
  usd_exchange_rate: number;
  contact_person_id: number;
  sign_person_id: number;
  authorized_signer_id: number;
  status: string;
  note: string;
  expected_delivery_date: string;
  items: PurchaseOrderItemInterface[];
  created_at: string;
}

export interface PurchaseOrderDto {
  id: number;
  purchase_order_no: string;
  order_date: string;
  status: string;
  currency_code: string;
  usd_exchange_rate: number;
  amount_local: number;
  amount_usd: number;
  contact_person: string;
  expected_delivery_date: string;
  invoiced_amount?: number;
  remaining_invoiced_amount?: number;
  invoiced_percentage?: number;
  allocated_amount?: number;
  remaining_allocation?: number;
  allocation_percentage?: number;
  purchase_order_smart_status: string;
  supplier?: string;
  region?: string;
}

export interface PurchaseOrderResponse {
  dto: PurchaseOrderDto[];
  total: number;
  page: number;
  pageSize: number | string;
  statistics: {
    total: number;
    total_approved: number;
    total_draft: number;
    total_usd_value: number;
    invoiced_percentage: number;
    allocated_percentage: number;
  };
}

export interface PurchaseOrderHistory {
  id: number;
  purchase_order_id: number;
  changed_at: string;
  changed_by: string;
  changed_field: string;
  new_values: string;
  old_values: string;
  reason: string;
  reason_created_at: string;
}
