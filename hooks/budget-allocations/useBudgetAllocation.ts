import { useQuery } from "@tanstack/react-query";
import { BudgetAllocationsResponse } from "@/types/budget-allocations/budget-allocations.type";

export type UseBudgetAllocationsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  sort?: string;
  startDate?: string; // format: YYYY-MM-DD
  endDate?: string; // format: YYYY-MM-DD
};

export const useBudgetAllocations = (params: UseBudgetAllocationsParams) => {
  const queryString = new URLSearchParams();

  if (params.page) queryString.append("page", String(params.page));
  if (params.pageSize) queryString.append("pageSize", String(params.pageSize));
  if (params.q) queryString.append("q", params.q);
  if (params.status) queryString.append("status", params.status);
  if (params.sort) queryString.append("sort", params.sort);
  if (params.startDate) queryString.append("startDate", params.startDate);
  if (params.endDate) queryString.append("endDate", params.endDate);

  const queryKey = ["budgetAllocations", params];

  return useQuery<BudgetAllocationsResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(
        `/api/budget-allocations?${queryString.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch budget allocations");
      const json = await res.json();
      return json.data;
    },
  });
};
