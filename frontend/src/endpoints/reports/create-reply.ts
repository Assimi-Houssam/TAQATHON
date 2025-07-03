import { apiClient } from "@/lib/axios";
import { Reply } from "@/types/report";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateReplyPayload {
  message: string;
}

export function useCreateReply(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReplyPayload) => {
      const { data } = await apiClient.post<Reply>(
        `/reports/${reportId}/replies`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate both report and report-replies queries
      queryClient.invalidateQueries({ queryKey: ["Report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["report-replies", reportId] });
    },
    onError: () => toast.error("Failed to send reply"),
  });
}
