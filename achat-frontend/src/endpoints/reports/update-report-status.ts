import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReportStatus } from "@/types/report";
import { apiClient } from "@/lib/axios";

interface UpdateReportStatusParams {
  id: string;
  status: ReportStatus;
}

const updateReportStatus = async ({ id, status }: UpdateReportStatusParams) => {
  const response = await apiClient.patch(`/reports/${id}/status`, { status });
  return response.data;
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReportStatus,
    onSuccess: (_, { id }) => {
      // Invalidate the specific report query
      queryClient.invalidateQueries({ queryKey: ["Report", id] });
      // Invalidate the reports list queries
      queryClient.invalidateQueries({ queryKey: ["Reports"] });
    },
  });
};
