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
