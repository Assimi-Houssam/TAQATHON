import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AgentsQueryParams } from "@/types";

interface Agent {
  id: string;
  name: string;
  role: string;
}

export function useGetTaqaAgents(params: AgentsQueryParams) {
  const { page, limit, search, departements } = params;

  return useQuery({
    queryKey: ["Agents", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/taqa/agents`, {
        params: { page, limit, search, departements },
        paramsSerializer: {
          indexes: null,
        },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 