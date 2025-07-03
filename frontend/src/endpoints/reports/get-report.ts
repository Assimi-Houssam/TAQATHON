import { apiClient } from "@/lib/axios";
import { Report } from "@/types/report";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGetReport(id: string) {
  return useQuery({
    queryKey: ["Report", id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<Report>(`/reports/${id}`);
        return data;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error getting report details");
        }
        throw error;
      }
    },
    refetchOnMount: true,
    staleTime: 0,
  });
}
