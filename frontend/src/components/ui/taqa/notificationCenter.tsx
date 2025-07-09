"use client";

import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  // useNotification,
  NotificationStatus,
} from "@/context/NotificationContext";
import NotificationContainer from "./NotificationContainer";
import { cn } from "@/lib/utils";
// import { useMarkAllNotificationsAsRead } from "@/endpoints/notifications/mutations";
import { toast } from "sonner";
import {
  // useGetAllNotifications,
  groupNotificationsByDate,
} from "@/endpoints/notifications/get-all-notifications";
import { safeFormat } from "@/lib/utils/date";
import { useInView } from "react-intersection-observer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AxiosError } from "axios";
interface NotificationCenterProps {
  className?: string;
}

type FilterStatus = "all" | NotificationStatus;

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
}) => {
  // const { unreadCount, markAllAsRead } = useNotification();
  const unreadCount = 0; // Default value when useNotification is disabled
  const markAllAsRead = () => {}; // Default empty function when useNotification is disabled
  // const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const markAllAsReadMutation = { mutateAsync: async () => {}, isPending: false }; // Default when disabled
  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
  //   useGetAllNotifications();
  
  // Default values when notifications are disabled
  const data = { pages: [{ data: [] }] };
  const fetchNextPage = () => {};
  const hasNextPage = false;
  const isFetchingNextPage = false;
  const isLoading = false;
  const { ref, inView } = useInView();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Failed to mark all notifications as read"
        );
      } else {
        toast.error("Failed to mark all notifications as read");
      }
    }
  };

  // Combine all pages of notifications
  const allNotifications = data?.pages.flatMap((page) => page.data) ?? [];

  // Filter notifications based on status (disabled - always empty)
  const filteredNotifications: any[] = [];

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative hover:bg-gray-100/50", className)}
        >
          <Bell className="scale-125 text-gray-700" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 h-6 min-w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1 border-2 border-white shadow-sm",
                unreadCount > 99 ? "w-auto" : "w-4",
                unreadCount > 999 ? "text-[10px]" : ""
              )}
            >
              {unreadCount > 999
                ? "999+"
                : unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="md:w-[42rem] w-[97vw] p-0 m-2 md:m-0"
        sideOffset={8}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-3 hover:bg-gray-100 gap-2"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </Button>
            )}
          </div>
          <div className="px-4 pb-2">
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={(value) => setFilterStatus(value as FilterStatus)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All
                  <span className="ml-1.5 text-[10px] text-gray-500">
                    ({allNotifications.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value={NotificationStatus.UNREAD}
                  className="text-xs"
                >
                  Unread
                  <span className="ml-1.5 text-[10px] text-gray-500">
                    ({unreadCount})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value={NotificationStatus.READ}
                  className="text-xs"
                >
                  Read
                  <span className="ml-1.5 text-[10px] text-gray-500">
                    ({allNotifications.length - unreadCount})
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea
          className="h-[32rem] min-h-[320px] max-h-[calc(100vh-12rem)]"
          type="always"
        >
          <div className="px-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="rounded-full bg-gray-100/80 p-3 mb-3">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {filterStatus === "all"
                    ? "No notifications yet"
                    : filterStatus === NotificationStatus.UNREAD
                    ? "No unread notifications"
                    : "No read notifications"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {filterStatus === "all" &&
                    "We'll notify you when something arrives"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedNotifications.map(([date, notifications], index) => (
                  <div key={`${date}-${index}`} className="space-y-1">
                    <div className="sticky top-0 bg-white px-3 py-3 mb-2 -mx-2 z-10">
                      <h6 className="text-xs font-medium text-gray-500">
                        {safeFormat(date, "EEEE, MMMM d", "Invalid date")}
                      </h6>
                    </div>
                    <div
                      className="space-y-2 p-2 pb-6"
                    >
                      {notifications.map((notification, notificationIndex) => (
                        <NotificationContainer
                          key={`${notification.id}-${index}-${notificationIndex}`}
                          notification={notification}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {hasNextPage && (
                  <div ref={ref} className="flex justify-center py-4">
                    {isFetchingNextPage && (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
