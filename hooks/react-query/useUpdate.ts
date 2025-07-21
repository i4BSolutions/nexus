import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPut } from "@/lib/react-query/apiClient";

export function useUpdate(resource: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiPut(`/api/${resource}/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
}
