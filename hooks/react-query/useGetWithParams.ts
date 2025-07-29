import { apiGet } from "@/lib/react-query/apiClient";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export function useGetWithParams<T, U extends Record<string, any>>(
  resource: string,
  filterParams: U
): UseQueryResult<T> {
  const queryParams: Record<string, string> = {};

  Object.entries(filterParams).forEach(([key, value]) => {
    if (value) {
      queryParams[key] = String(value);
    }
  });

  const queryString = new URLSearchParams(queryParams).toString();

  return useQuery<T>({
    queryKey: [resource, queryString],
    queryFn: () => apiGet<T>(`/api/${resource}?${queryString}`),
  });
}
