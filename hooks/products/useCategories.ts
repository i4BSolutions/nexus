import { CategoryInterface } from "@/types/category/category.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () => {
  return useQuery<ApiResponse<CategoryInterface[]>>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
};
