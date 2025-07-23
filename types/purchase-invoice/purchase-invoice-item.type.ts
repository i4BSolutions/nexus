export interface PurchaseInvoiceItemInterface {
  id: number;
  product_name: string;
  quantity: number;
  unit_price_local: number;
  unit_price_usd: number;
  sub_total_local: number;
  sub_total_usd: number;
}
