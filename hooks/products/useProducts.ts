import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/types/api-response-type";
import { ProductResponse } from "@/types/product/product.type";

export function useProducts(params: {
  page: number;
  pageSize: number;
  searchText?: string;
  stockStatusFilter?: string;
  selectedCategory?: string;
}) {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    ...(params.searchText && { search: params.searchText }),
    ...(params.stockStatusFilter && { stock_status: params.stockStatusFilter }),
    ...(params.selectedCategory && { category: params.selectedCategory }),
  });

  return useQuery<ApiResponse<ProductResponse>>({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}
