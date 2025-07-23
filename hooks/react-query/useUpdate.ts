import { apiPut } from "@/lib/react-query/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdate(resource: string, queryKey?: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiPut(`/api/${resource}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
