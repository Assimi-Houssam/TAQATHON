import { apiClient } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useGetProfile(id: string) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/users/taqa/profile/${id}`);
        return data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || "Failed to fetch user profile";
          throw new Error(errorMessage);
        }
        throw new Error("An unexpected error occurred while fetching the profile");
      }
    },
    retry: 1,
    enabled: Boolean(id),
  });
}
