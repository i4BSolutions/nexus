import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/react-query/apiClient";

export function useList(
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
    queryFn: () => apiGet(`/api/${resource}?${queryString}`),
    placeholderData: (previousData) => previousData,
  });
}
