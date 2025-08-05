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
  is_voided: boolean;
  invoice_items?: PurchaseInvoiceItemInterface[];
  purchase_order_id?: string;
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
  is_voided: boolean;
  supplier_name?: string;
  delivered_percentage?: number;
  pending_delivery_percentage?: number;
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

export interface PurchaseInvoiceHistory {
  id: number;
  purchase_invoice_id: number;
  changed_at: string;
  changed_by: string;
  changed_field: string;
  new_values: string;
  old_values: string;
  reason: string;
  reason_created_at: string;
}

export interface InvoiceFormProps {
  formData?: PurchaseInvoiceInterface;
  handleNext?: (data: PurchaseInvoiceInterface) => void;
}

export interface InvoiceFieldType {
  invoice_number: string;
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
