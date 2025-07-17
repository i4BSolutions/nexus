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

export interface InvoiceFormProps {
  formData?: PurchaseInvoiceInterface;
  handleNext?: (data: PurchaseInvoiceInterface) => void;
}

export interface InvoiceFieldType {
  invoiceNumber: string;
  invoice_date: string;
  due_date: string;
  currency: number;
  usd_exchange_rate: number;
  purchase_order: number;
  invoice_items: {
    checked: boolean;
    product: number;
    invoice_quantity: number;
    invoice_unit_price_local: number;
  }[];
  note?: string;
}
