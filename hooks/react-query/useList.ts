import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery } from "@tanstack/react-query";

export function useList<T>(
  resource: string,
  { page = 1, pageSize = 10, q = "", status = "", sort = "" } = {}
) {
  const queryParams: Record<string, string> = {
    page: String(page),
    pageSize: String(pageSize),
  };

  if (q) queryParams.q = q;
  if (status) queryParams.status = status;
  if (sort) queryParams.sort = sort;

  const queryString = new URLSearchParams(queryParams).toString();

  return useQuery({
    queryKey: [resource, "list"],
    queryFn: () => apiGet<T>(`/api/${resource}?${queryString}`),
    placeholderData: (previousData) => previousData,
  });
}
