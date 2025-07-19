import { PurchaseInvoiceItemInterface } from "./purchase-invoice-item.type";

export interface PurchaseInvoiceInterface {
  id: number;
  purchase_invoice_number: string;
  invoice_date: string;
  due_date: string;
  currency_code: string;
  usd_exchange_rate: number;
  status: string;
  note?: string;
  invoice_items?: PurchaseInvoiceItemInterface[];
  purchase_order_no: string;
  purchase_order_currency_code?: string;
  purchase_order_exchange_rate?: number;
}

export interface PurchaseInvoiceDto {
  id: number;
  purchase_invoice_number: string;
  purchase_order_no: string;
  invoice_date: string;
  due_date: string;
  currency_code: string;
  usd_exchange_rate: number;
  total_amount_local: number;
  total_amount_usd: number;
  status: string;
  note?: string;
}

export interface PurchaseInvoiceResponse {
  items: PurchaseInvoiceDto[];
  total: number;
  page: number;
  pageSize: number;
  statistics: {
    total_invoices: number;
    total_usd: number;
    delivered: number;
  };
}
