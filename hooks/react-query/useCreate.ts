import { apiPost } from "@/lib/react-query/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreate(resource: string, queryKey?: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost(`/api/${resource}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey || [resource, "list"],
      });
    },
  });
}
