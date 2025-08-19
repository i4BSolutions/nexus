import { ProductResponse } from "@/types/product/product.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { useQuery } from "@tanstack/react-query";

export function useProducts(params: {
  page: number;
  pageSize: number;
  searchText?: string;
  stockStatusFilter?: string;
  selectedCategory?: string;
  sort?: string;
}) {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    ...(params.searchText && { search: params.searchText }),
    ...(params.stockStatusFilter && { stock_status: params.stockStatusFilter }),
    ...(params.selectedCategory && { category: params.selectedCategory }),
    ...(params.sort && { sort: params.sort }),
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
