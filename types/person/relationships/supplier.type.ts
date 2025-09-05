export interface RelatedSupplierItem {
  id: number;
  supplier_name: string;
  email: string | null;
  phone: string | null;
  status: "Active" | "Inactive";
}

export interface RelatedSupplierResponse {
  items: RelatedSupplierItem[];
  total: number;
  page: number;
  pageSize: number;
}
