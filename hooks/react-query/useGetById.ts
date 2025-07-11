import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery } from "@tanstack/react-query";

export function useGetById<T>(resource: string, id: string, enabled = true) {
  return useQuery({
    queryKey: [resource, "get", id],
    queryFn: () => apiGet<T>(`/api/${resource}/${id}`),
    enabled,
  });
}
