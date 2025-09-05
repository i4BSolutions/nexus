import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

type PaginatedQueryParams = {
  page?: number;
  pageSize?: number | "all";
};

export function usePaginatedById<T>(
  resource: string,
  id?: string | number,
  { page = 1, pageSize = 10 }: PaginatedQueryParams = {},
  enabled = true
) {
  const queryKey = [resource, id, "paginated", page, pageSize];

  return useQuery({
    queryKey,
    enabled: enabled && !!id,
    placeholderData: keepPreviousData,
    queryFn: () =>
      apiGet<T>(`/api/${resource}/${id}?page=${page}&pageSize=${pageSize}`),
  });
}
