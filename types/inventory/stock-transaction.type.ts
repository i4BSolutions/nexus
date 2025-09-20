export interface VoidPreview {
  id: number;
  type: "IN" | "OUT";
  product_name: string;
  product_sku: string;
  abs_delta: number;
  warehouse_name: string;
  date: string;
  fromQty: number;
  toQty: number;
  reference: string;
}

type TxType = "IN" | "OUT";

export interface TxRow {
  id: number;
  created_at: string;
  quantity: number;
  type: TxType;
  reason: string | null;
  note: string | null;
  is_voided?: boolean;
  product_id: number;
  warehouse_id: number;
  product: { sku: string; name: string };
  warehouse: { name: string };
}
