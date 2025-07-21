import { useMutation } from "@tanstack/react-query";
import { apiDelete } from "@/lib/react-query/apiClient";

export function useDelete(resource: string) {
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/${resource}/${id}`),
  });
}
