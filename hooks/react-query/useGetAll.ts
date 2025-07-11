import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetAll<T>(url: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  const queryKeyWithAction = [...queryKey];

  return useQuery({
    queryKey: queryKeyWithAction,
    queryFn: () => apiGet<T>(`/api/${url}`),
  });
}
