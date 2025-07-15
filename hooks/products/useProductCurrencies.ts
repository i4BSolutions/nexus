import { useQuery } from "@tanstack/react-query";
import { ProductCurrencyInterface } from "@/types/product/product.type";
import { apiGet } from "@/lib/react-query/apiClient";

export const useProductCurrencies = () =>
  useQuery<ProductCurrencyInterface[]>({
    queryKey: ["product-currencies"],
    queryFn: () =>
      apiGet<ProductCurrencyInterface[]>(
        "/api/products/get-product-currencies"
      ),
  });
