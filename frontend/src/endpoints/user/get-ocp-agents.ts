import { apiClient } from "@/lib/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import qs from "qs";

interface AgentsQueryParams {
  page: number;
  limit: number;
  search?: string;
  departements?: number[];
}

export function useGetOcpAgents(params: AgentsQueryParams) {
  const { page, limit, search, departements } = params;

  return useQuery({
    queryKey: ["Agents", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/ocp/agents`, {
        params: { page, limit, search, departements },
        paramsSerializer: {
          serialize: (params) => qs.stringify(params, { arrayFormat: "comma" }),
        },
      });
      return {
        users: data.users || [],
        total: data.total || 0,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
