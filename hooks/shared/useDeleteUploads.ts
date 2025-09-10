// hooks/react-query/useDeleteUpload.ts
import { useMutation } from "@tanstack/react-query";

interface DeletePayload {
  key?: string;
  keys?: string[];
}

interface DeleteResponse {
  status: "success" | "error";
  message: string;
  data?: { removed: string[] };
}

export function useDeleteUpload() {
  return useMutation<DeleteResponse, Error, DeletePayload>({
    mutationFn: async (payload: DeletePayload) => {
      const res = await fetch("/api/uploads/direct", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Delete failed");
      }
      return json;
    },
  });
}
