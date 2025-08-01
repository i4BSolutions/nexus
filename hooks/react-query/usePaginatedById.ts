import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery } from "@tanstack/react-query";

type PaginatedQueryParams = {
  page?: number;
  pageSize?: number;
};

export function usePaginatedById<T>(
  resource: string,
  id: string,
  { page = 1, pageSize = 10 }: PaginatedQueryParams = {},
  enabled = true
) {
  const queryParams: Record<string, string> = {
    page: String(page),
    pageSize: String(pageSize),
  };

  const queryString = new URLSearchParams(queryParams).toString();

  return useQuery({
    queryKey: [resource, id, "paginated"],
    queryFn: () => apiGet<T>(`/api/${resource}/${id}?${queryString}`),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
