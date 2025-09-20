export interface ProductAliasInterface {
  id: number;
  created_at: string;
  name: string;
  type_id: number;
  language_id: number;
  product_id: number;
  type?: { id: number; name: string };
  language?: { id: number; name: string };
  product?: { id: number; name: string };
}
