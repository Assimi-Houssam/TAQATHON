import { apiClient } from "@/lib/axios";
import { CompanyApprovalStatus } from "@/types/entities/enums/index.enum";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface CompaniesQueryParams {
  page: number;
  limit: number;
  search?: string;
  approved?: boolean;
  business_scope_ids?: number[];
  approval_status?: CompanyApprovalStatus[];
}

export function useGetAllCompanies(params: CompaniesQueryParams) {
  const { page, limit, search, approved, business_scope_ids, approval_status } = params;

  return useQuery({
    queryKey: ["Companies", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/companies`, {
        params: {
          page,
          limit,
          search,
          approved,
          business_scope_ids: business_scope_ids?.length ? business_scope_ids.join(",") : undefined,
          approval_status: approval_status?.length ? approval_status.join(",") : undefined,
        },
      });
      return {
        companies: data.companies || [],
        total: data.total || 0
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
