import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery } from "@tanstack/react-query";

export function useList<T>(
  resource: string,
  { page = 1, pageSize = 10, q = "", status = "", sort = "" } = {}
) {
  const queryString = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    q,
    status,
    sort,
  }).toString();

  return useQuery({
    queryKey: [resource, "list", page, pageSize, q, status, sort],
    queryFn: () => apiGet<T>(`/api/${resource}?${queryString}`),
    placeholderData: (previousData) => previousData,
  });
}
