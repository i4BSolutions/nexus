import { apiDelete } from "@/lib/react-query/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDelete(resource: string, queryKey?: string[]) {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/${resource}/${id}`),
    onSuccess: () => {
      query.invalidateQueries({ queryKey: queryKey || [resource, "list"] });
    },
  });
}
