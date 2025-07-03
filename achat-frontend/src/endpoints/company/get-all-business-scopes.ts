import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useGetAllBusinessScopes() {
  return useQuery({
    queryKey: ["BusinessScopes"],
    queryFn: async () => {
      const { data: businessScopes } = await apiClient.get(
        "/companies/business-scope"
      );
      return businessScopes;
    },
  });
}
