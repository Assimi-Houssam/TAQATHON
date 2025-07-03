import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/entities";

export function useGetCompanyMembers(companyId?: number) {
  return useQuery<User[]>({
    queryKey: ["CompanyMembers", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("No company ID provided");
      const { data: members } = await apiClient.get(`/companies/${companyId}/members`);
      return members;
    },
    enabled: !!companyId,
  });
}
