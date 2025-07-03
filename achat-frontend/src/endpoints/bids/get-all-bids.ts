import { apiClient } from "@/lib/axios";
import { Bid } from "@/types/entities/index";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface BidsResponse {
  data: Bid[];
  total: number;
}

interface GetAllBidsParams {
  page: number;
  limit: number;
  enabled?: boolean;
  purchaseRequestId?: number;
}

export function useGetAllBids({
  page,
  limit,
  enabled = true,
  purchaseRequestId,
}: GetAllBidsParams) {
  return useQuery({
    queryKey: ["Bids", page, limit, purchaseRequestId],
    queryFn: async () => {
      const params: Record<string, number> = {
        page: page,
        limit: limit,
      };

      const { data } = await apiClient.get<BidsResponse>(
        `/ocp/purchase-requests/${purchaseRequestId}/bids`,
        {
          params,
        }
      );

      console.log(data);

      return {
        bids: data.data || [],
        total: data.total || 0,
      };
    },
    enabled: enabled && !!purchaseRequestId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
