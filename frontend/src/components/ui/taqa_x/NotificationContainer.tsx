"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  // useNotification,
  NotificationType,
  NotificationStatus,
  Notification,
} from "@/context/NotificationContext";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  MessageSquare,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Bell,
  Timer,
  Award,
  Lock,
  Calendar,
  Building,
  X as CloseIcon,
  ArrowRight,
} from "lucide-react";
import { safeFormatDistanceToNow } from "@/lib/utils/date";
import {
  useMarkNotificationAsRead,
  useDeleteNotification,
} from "@/endpoints/notifications/mutations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AxiosError } from "axios";

interface NotificationContainerProps {
  notification: Notification;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notification,
}) => {
  // const { removeNotification, markAsRead } = useNotification();
  const removeNotification = () => {}; // Default when disabled
  const markAsRead = () => {}; // Default when disabled
  const router = useRouter();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_PURCHASE_REQUEST:
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case NotificationType.MESSAGE:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case NotificationType.BID_INVIATION:
        return <Bell className="h-4 w-4 text-purple-500" />;
      case NotificationType.COMPANY_NEEDS_VERIFICATION:
      case NotificationType.COMPANY_JOINING_REQUEST:
        return <Building2 className="h-4 w-4 text-orange-500" />;
      case NotificationType.COMPANY_VERIFIED:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case NotificationType.COMPANY_NOT_VERIFIED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case NotificationType.PURCHASE_REQUEST_POSTPONED:
        return <Timer className="h-4 w-4 text-yellow-500" />;
      case NotificationType.DISQUALIFIED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case NotificationType.NEW_BID:
        return <Bell className="h-4 w-4 text-blue-500" />;
      case NotificationType.FEEDBACK:
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case NotificationType.WINNING_BID:
        return <Award className="h-4 w-4 text-yellow-500" />;
      case NotificationType.BID_LOCKED:
        return <Lock className="h-4 w-4 text-gray-500" />;
      case NotificationType.BID_bidding_deadline:
        return <Calendar className="h-4 w-4 text-red-500" />;
      case NotificationType.PURCHASE_REQUEST_CANCELLED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case NotificationType.SUPPLIER_NEEDS_A_COMPANY:
        return <Building className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStyles = (status: NotificationStatus) => {
    const isUnread = status === NotificationStatus.UNREAD;
    return {
      container: cn(
        "p-3 cursor-pointer transition-all rounded-lg relative group border",
        isUnread
          ? "bg-blue-50/30 hover:bg-blue-50/50 border-blue-100"
          : "hover:bg-gray-50/80 border-transparent hover:border-gray-100"
      ),
      icon: cn(
        "flex-shrink-0 mt-1 p-2 rounded-lg shadow-sm",
        isUnread ? "bg-white" : "bg-gray-50"
      ),
      message: cn(
        "text-sm line-clamp-2",
        isUnread ? "text-gray-900 font-medium" : "text-gray-600"
      ),
      indicator:
        "absolute top-1/2 -translate-y-1/2 right-3 w-[6px] h-[6px] bg-blue-500 rounded-full",
    };
  };

  const handleNotificationClick = async () => {
    if (notification.notification_status === NotificationStatus.UNREAD) {
      try {
        await markAsReadMutation.mutateAsync(notification.id);
        markAsRead(notification.id);

        // Handle navigation based on notification type
        if (notification.purchase_request) {
          router.push(
            `/dashboard/purchase-requests/${notification.purchase_request.id}`
          );
        } else if (notification.bid) {
          router.push(`/dashboard/bids/${notification.bid.id}`);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(
            error.response?.data?.message ||
              "Failed to mark notification as read"
          );
        } else {
          toast.error("Failed to mark notification as read");
        }
      }
    } else {
      // Handle navigation for read notifications
      if (notification.purchase_request) {
        router.push(
          `/dashboard/purchase-requests/${notification.purchase_request.id}`
        );
      } else if (notification.bid) {
        router.push(`/dashboard/bids/${notification.bid.id}`);
      }
    }
  };

  const handleRemoveNotification = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(notification.id);
      removeNotification(notification.id);
      toast.success("Notification removed");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to remove notification"
        );
      } else {
        toast.error("Failed to remove notification");
      }
    }
  };

  const styles = getStyles(notification.notification_status);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        onClick={handleNotificationClick}
        className={styles.container}
      >
        <div className="flex items-start gap-3">
          <div className={styles.icon}>
            {getIcon(notification.notification_type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={styles.message}>
              {notification.notification_message}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-xs text-gray-500">
                            {safeFormatDistanceToNow(notification.created_at, {
              addSuffix: true,
            }, "")}
              </p>
              {(notification.purchase_request || notification.bid) && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                    View details
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </>
              )}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 absolute top-2 right-2"
                onClick={handleRemoveNotification}
                disabled={deleteMutation.isPending}
              >
                <CloseIcon className="h-3 w-3 text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove notification</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {notification.notification_status === NotificationStatus.UNREAD && (
          <div className={styles.indicator} />
        )}
      </motion.div>
    </TooltipProvider>
  );
};

export default NotificationContainer;
