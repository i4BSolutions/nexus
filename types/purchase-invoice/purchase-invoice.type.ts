import { PurchaseInvoiceItemInterface } from "./purchase-invoice-item.type";

export interface PurchaseInvoiceInterface {
  id: number;
  purchase_invoice_number: string;
  purchase_order_no: string;
  invoice_date: string;
  due_date: string;
  currency_code: string;
  usd_exchange_rate: number;
  status: string;
  note?: string;
  invoice_items: PurchaseInvoiceItemInterface[];
}
