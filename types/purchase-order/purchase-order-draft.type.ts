export interface PurchaseOrderDraftInterface {
  id: number;
  user_id: string;
  po_number?: string;
  supplier_id?: number;
  region_id?: number;
  budget_id?: number;
  order_date?: string;
  currency_id?: number;
  usd_exchange_rate?: number;
  contact_person_id?: number;
  sign_person_id?: number;
  authorized_signer_id?: number;
  expected_delivery_date?: string;
  note?: string;
  form_data: Record<string, any>;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderDraftResponse {
  data: PurchaseOrderDraftInterface[];
  total: number;
  page: number;
  pageSize: number;
}
