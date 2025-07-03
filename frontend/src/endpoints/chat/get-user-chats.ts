import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useGetAllChats() {
  return useQuery({
    queryKey: ["ApiChats"],
    queryFn: async () => {
      try {
        const { data: ApiChats } = await apiClient.get(`/chats`);
        return ApiChats;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch chats: ${error.message}`);
        }
        throw new Error("Failed to fetch chats");
      }
    },
  });
}
