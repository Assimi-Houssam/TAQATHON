import { apiClient } from "@/lib/axios";
import { BusinessScope } from "@/types/entities";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useGetBusinessScopes() {
  return useQuery({
    queryKey: ["BusinessScopes"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<BusinessScope[]>(
          `/companies/business-scope`
        );
        return data;
      } catch (error) {
        if (error instanceof AxiosError) {
          const message = error.response?.data?.message || "Failed to fetch business scopes";
          toast.error(message);
        }
        throw error;
      }
    },
    retry: 2,
  });
}
