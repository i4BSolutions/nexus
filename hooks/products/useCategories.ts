import { useQuery } from "@tanstack/react-query";
import { CategoryInterface } from "@/types/category/category.type";
import { ApiResponse } from "@/types/api-response-type";

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
