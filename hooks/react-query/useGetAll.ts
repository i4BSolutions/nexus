import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery } from "@tanstack/react-query";

export function useGetAll<T>(url: string, queryKeys: string[]) {
  return useQuery({
    queryKey: queryKeys,
    queryFn: () => apiGet<T>(`/api/${url}`),
  });
}
