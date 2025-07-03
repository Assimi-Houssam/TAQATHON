import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface ReportsQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export function useGetReports(params: ReportsQueryParams) {
  const { page, limit, search, status } = params;

  return useQuery({
    queryKey: ["Reports", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reports`, {
        params: { page, limit, search, status },
      });
      return {
        reports: data.reports || [],
        total: data.total || 0,
      };
    },
  });
}
