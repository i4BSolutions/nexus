export interface RelatedPOItem {
  id: number;
  purchase_order_no: string;
  supplier_name: string;
  supplier_active: boolean;
  order_date: string;
  expected_delivery_date: string;
  currency_code: string | null;
  amount_local: number;
  amount_usd: number;
  status: string;
  approval_status: string;
}

export interface RelatedPOResponse {
  items: RelatedPOItem[];
  total: number;
  page: number;
  pageSize: number;
}
