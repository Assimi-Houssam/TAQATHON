import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Company } from "@/types/entities";

export function useGetCompanyById(companyId?: number) {
  return useQuery<Company>({
    queryKey: ["Company", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("No company ID provided");
      const { data: company } = await apiClient.get(`/companies/${companyId}`);
      return company;
    },
    enabled: !!companyId,
  });
}
