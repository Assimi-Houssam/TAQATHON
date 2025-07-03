import { apiClient } from "@/lib/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Notification } from "@/context/NotificationContext";
import { AxiosError } from "axios";

export type NotificationsError = {
  message: string;
  status: number;
};

export interface NotificationsResponse {
  data: Notification[];
  hasMore: boolean;
}

export function useGetAllNotifications(limit = 10) {
  return useInfiniteQuery<NotificationsResponse, NotificationsError>({
    queryKey: ["notifications", limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data } = await apiClient.get(`/notifications`, {
          params: {
            page: pageParam,
            limit,
            sort: "created_at:desc", // Sort by newest first
          },
        });
        
        // Transform the response to match our interface
        return {
          data,
          hasMore: data.length === limit,
        };
      } catch (error: unknown) {
        throw {
          message:
            error instanceof AxiosError
              ? error.response?.data?.message || error.message
              : error instanceof Error
              ? error.message
              : "Failed to fetch notifications",
          status:
            error instanceof AxiosError ? error.response?.status || 500 : 500,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Utility functions
export const getUnreadNotifications = (notifications: Notification[]) =>
  notifications.filter((notification) => notification.notification_status === "UNREAD");

export const getReadNotifications = (notifications: Notification[]) =>
  notifications.filter((notification) => notification.notification_status === "READ");

export const getNotificationsByType = (notifications: Notification[], type: string) =>
  notifications.filter((notification) => notification.notification_type === type);

export const getNotificationsByDate = (notifications: Notification[], date: Date) =>
  notifications.filter(
    (notification) =>
      new Date(notification.created_at).toDateString() === date.toDateString()
  );

// Group notifications by date
export const groupNotificationsByDate = (notifications: Notification[]) => {
  const groups = notifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return Object.entries(groups).sort((a, b) => 
    new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
};
