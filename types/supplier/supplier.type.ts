import { PurchaseInvoiceDto } from "../purchase-invoice/purchase-invoice.type";
import { PurchaseOrderDto } from "../purchase-order/purchase-order.type";

export interface SupplierInterface {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuppliersResponse {
  items: SupplierInterface[];
  total: number;
  page: number;
  pageSize: number;
  statistics: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface SupplierPurchaseOrderHistoryResponse {
  dto: PurchaseOrderDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SupplierInvoiceHistoryResponse {
  data: PurchaseInvoiceDto[];
  total: number;
  page: number;
  pageSize: number;
}
