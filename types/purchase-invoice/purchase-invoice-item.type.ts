export interface PurchaseInvoiceItemInterface {
  id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price_local: number;
  unit_price_usd: number;
  sub_total_local: number;
  sub_total_usd: number;
  po_unit_price_local?: number;
  po_unit_price_usd?: number;
  total_ordered?: number;
  total_available?: number;
  remaining_to_stock_in?: number;
}
