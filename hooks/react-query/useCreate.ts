import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/react-query/apiClient";

export function useCreate(resource: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost(`/api/${resource}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
}
