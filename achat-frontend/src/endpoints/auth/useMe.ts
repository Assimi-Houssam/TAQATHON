import { apiClient } from "@/lib/axios";
import { User } from "@/types/entities/index";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";

export function useMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = getCookie("access_token");
      if (!token) return null;

      const { data } = await apiClient.get<User>("/auth/me");
      return data;
    },
    retry: false,
  });
}
