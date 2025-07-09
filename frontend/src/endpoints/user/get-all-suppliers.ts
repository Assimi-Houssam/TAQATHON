import { apiClient } from "@/lib/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface SuppliersQueryParams {
  page: number;
  limit: number;
  search?: string;
}

export function useGetAllSuppliers(params: SuppliersQueryParams) {
  const { page, limit, search } = params;

  return useQuery({
    queryKey: ["Suppliers", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/taqa/suppliers`, {
        params: { page, limit, search },
      });
      return {
        users: data.users || [],
        total: data.total || 0
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
