import { apiClient } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Message } from "@/types/entities";

interface MessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export function useGetChatMessages(chatId: number | null, pageSize: number = 50) {
  return useInfiniteQuery({
    queryKey: ["chatMessages", chatId],
    queryFn: async ({ pageParam = 1 }) => {
      if (chatId === null) {
        return {
          messages: [],
          total: 0,
          hasMore: false,
        } as MessagesResponse;
      }

      try {
        const { data } = await apiClient.get<MessagesResponse>(
          `/messages/chat/${chatId}`,
          {
            params: {
              page: pageParam,
              limit: pageSize,
            },
          }
        );
        return data;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error getting chat messages");
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    getPreviousPageParam: (firstPage, allPages) => {
      if (allPages.length <= 1) return undefined;
      return allPages.length - 1;
    },
    initialPageParam: 1,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      messages: data.pages.flatMap((page) => page.messages),
    }),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    gcTime: 0,
    staleTime: 0,
  });
}
