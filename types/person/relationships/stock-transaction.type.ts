export interface RelatedTransactionItem {
  id: number;
  created_at: string;
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  direction: string;
  quantity: number;
  reference: string | null;
  note: string | null;
  evidence: Array<{
    key: string;
    name?: string | null;
    mime?: string | null;
    size?: number | null;
    type?: string | null; // "photo" | "pdf"
    url: string;
  }>;
}

export interface RelatedTransactionResponse {
  items: RelatedTransactionItem[];
  total: number;
  page: number;
  pageSize: number;
}
