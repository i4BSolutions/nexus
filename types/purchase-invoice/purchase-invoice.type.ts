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

export interface PurchaseInvoiceDto {
  id: number;
  purchase_invoice_number: string;
  purchase_order_number: string;
  invoice_date: string;
  due_date: string;
  currency_code: string;
  usd_exchange_rate: number;
  status: string;
  note?: string;
}

export interface PurchaseInvoiceResponse {
  items: PurchaseInvoiceDto[];
  total: number;
  page: number;
  pageSize: number;
  statistics: {
    total: number;
    total_invoiced: number;
    total_allocated: number;
    invoiced_percentage: number;
    allocated_percentage: number;
  };
}
