import { PurchaseOrderItemDetailInterface } from "./purchase-order-item.type";

export interface PurchaseOrderInterface {
  id: number;
  purchase_order_no: string;
  supplier_id: number;
  region_id: number;
  budget_id: number;
  order_date: string;
  currency_id: number;
  usd_exchange_rate: number;
  contact_person_id: number;
  sign_person_id: number;
  authorized_signer_id: number;
  status: string;
  note: string;
  expected_delivery_date: string;
  items: PurchaseOrderItemDetailInterface[];
  created_at: string;
}

export interface PurchaseOrderDetailInterface extends PurchaseOrderInterface {
  supplier: {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    status: boolean;
  };
  region: {
    name: string;
  };
  currency: {
    currency_code: string;
    currency_name: string;
  };
  budget?: {
    budget_name: string;
    project_name: string;
    description: string;
    status: string;
  };
  contact_person: {
    name: string;
  };
  sign_person?: {
    name: string;
  };
  authorized_signer?: {
    name: string;
  };
}

export interface GetPurchaseOrderDto {
  id: number;
  purchase_order_no: string;
  order_date: string;
  status: string;
  currency_code: string;
  usd_exchange_rate: number;
  amount: number;
  contact_person: string;
  expected_delivery_date: string;
  invoiced_amount?: number;
  allocated_amount?: number;
}

export interface GetPurchaseOrderResponse {
  dto: GetPurchaseOrderDto[];
  total: number;
  page: number;
  pageSize: number;
  statistics: {
    total: number;
    total_approved: number;
    total_usd_value: number;
    invoiced_percentage: number;
    allocated_percentage: number;
  };
}
