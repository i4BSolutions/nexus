import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery } from "@tanstack/react-query";

export const useProductSKU = () =>
  useQuery<string>({
    queryKey: ["product-sku"],
    queryFn: () => apiGet<string>("/api/products/get-product-sku"),
  });
