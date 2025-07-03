import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Reply } from "@/types/report";

export interface GetRepliesResponse {
  replies: Reply[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useGetReportReplies(reportId: string | number) {
  return useInfiniteQuery<
    GetRepliesResponse,
    Error,
    { pages: GetRepliesResponse[]; pageParams: number[] },
    [string, string | number],
    number
  >({
    queryKey: ["report-replies", reportId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<GetRepliesResponse>(
        `/reports/${reportId}/replies`,
        {
          params: {
            page: pageParam,
            limit: 5,
          },
        }
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}
