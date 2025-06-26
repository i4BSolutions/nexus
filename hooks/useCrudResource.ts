import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/react-query/apiClient";

export function useCrudResource(resource: string) {
  const queryClient = useQueryClient();

  // Get List
  const useList = ({
    page = 1,
    pageSize = 10,
    q = "",
    status = "",
    sort = "",
  } = {}) => {
    const queryString = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      q,
      status,
      sort,
    }).toString();

    return useQuery({
      queryKey: [resource, "list", page, pageSize, q, status, sort],
      queryFn: () => apiGet(`/api/${resource}?${queryString}`),
      placeholderData: (previousData) => previousData,
    });
  };

  // Get Single by ID
  const useGetById = (id: string, enabled = true) =>
    useQuery({
      queryKey: [resource, "get", id],
      queryFn: () => apiGet(`/api/${resource}/${id}`),
      enabled,
    });

  // Create
  const useCreate = () =>
    useMutation({
      mutationFn: (data: any) => apiPost(`/api/${resource}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resource] });
      },
    });

  //  Update
  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: any }) =>
        apiPut(`/api/${resource}/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resource] });
      },
    });

  // Delete
  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => apiDelete(`/api/${resource}/${id}`),
    });

  return {
    useList,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
  };
}
