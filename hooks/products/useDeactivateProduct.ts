import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "@/types/shared/api-response-type";

export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    Error,
    { id: string; is_active: boolean }
  >({
    mutationFn: async ({ id, is_active }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message || "Failed to update product status");
      }

      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products", id] });
    },
  });
};
