import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/react-query/apiClient";

export function useGetById(resource: string, id: string, enabled = true) {
  return useQuery({
    queryKey: [resource, "get", id],
    queryFn: () => apiGet(`/api/${resource}/${id}`),
    enabled,
  });
}
