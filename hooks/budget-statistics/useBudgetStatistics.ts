import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/react-query/apiClient";

export function useBudgetStatistics() {
  return useQuery({
    queryKey: ["budgets", "statistics"],
    queryFn: () => apiGet("/api/budgets/statistics"),
  });
}
