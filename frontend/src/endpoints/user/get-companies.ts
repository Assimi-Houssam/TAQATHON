import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useGetUserCompanies(userId?: number) {
  return useQuery({
    queryKey: ["user-companies", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${userId}/companies`);
      return data;
    },
    enabled: !!userId,
  });
}
