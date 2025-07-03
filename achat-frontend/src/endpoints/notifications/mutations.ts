import { apiClient } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationStatus } from "@/context/NotificationContext";
import { AxiosError } from "axios";

export type NotificationMutationError = {
  message: string;
  status: number;
};

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, NotificationMutationError, number>({
    mutationFn: async (id: number) => {
      try {
        await apiClient.patch(`/notifications/${id}`, {
          notification_status: NotificationStatus.READ,
        });
      } catch (error: unknown) {
        throw {
          message:
            error instanceof AxiosError
              ? error.response?.data?.message || error.message
              : error instanceof Error
              ? error.message
              : "Failed to mark notification as read",
          status:
            error instanceof AxiosError ? error.response?.status || 500 : 500,
        };
      }
    },
    onSuccess: () => {
      // Invalidate notifications query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, NotificationMutationError>({
    mutationFn: async () => {
      try {
        await apiClient.patch(`/notifications/mark-all-read`);
      } catch (error: unknown) {
        throw {
          message:
            error instanceof AxiosError
              ? error.response?.data?.message || error.message
              : error instanceof Error
              ? error.message
              : "Failed to mark all notifications as read",
          status:
            error instanceof AxiosError ? error.response?.status || 500 : 500,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation<void, NotificationMutationError, number>({
    mutationFn: async (id: number) => {
      try {
        await apiClient.delete(`/notifications/${id}`);
      } catch (error: unknown) {
        throw {
          message:
            error instanceof AxiosError
              ? error.response?.data?.message || error.message
              : error instanceof Error
              ? error.message
              : "Failed to delete notification",
          status:
            error instanceof AxiosError ? error.response?.status || 500 : 500,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
} 