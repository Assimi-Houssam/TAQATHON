'use client';

import { PurchaseRequest } from '@/types/entities';
import { Bid } from '@/types/entities';
import { User } from '@/types/entities';
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Align with backend enums
export enum NotificationType {
  NEW_PURCHASE_REQUEST = 'NEW PURCHASE REQUEST',
  MESSAGE = 'MESSAGE',
  BID_INVIATION = 'BID INVITATION',
  COMPANY_NEEDS_VERIFICATION = 'COMPANY NEEDS VERIFICATION',
  COMPANY_JOINING_REQUEST = 'COMPANY JOINING REQUEST',
  COMPANY_VERIFIED = 'COMPANY VERIFIED',
  COMPANY_NOT_VERIFIED = 'COMPANY NOT VERIFIED',
  PURCHASE_REQUEST_POSTPONED = 'PURCHASE REQUEST POSTPONED',
  DISQUALIFIED = 'DISQUALIFIED',
  NEW_BID = 'NEW BID',
  FEEDBACK = 'FEEDBACK',
  WINNING_BID = 'WINNING BID',
  BID_LOCKED = 'BID LOCKED',
  BID_bidding_deadline = 'BID DUE DATE',
  PURCHASE_REQUEST_CANCELLED = 'PURCHASE REQUEST CANCELLED',
  SUPPLIER_NEEDS_A_COMPANY = 'SUPPLIER NEEDS A COMPANY',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

export interface Notification {
  id: number;
  notification_type: NotificationType;
  notification_message: string;
  notification_status: NotificationStatus;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  // Optional relations
  creator?: User;
  bid?: Bid;
  purchase_request?: PurchaseRequest;
  users?: User[];
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: number }
  | { type: 'MARK_AS_READ'; payload: number }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ALL' };

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        notifications: action.payload,
        unreadCount: action.payload.filter(
          (n) => n.notification_status === NotificationStatus.UNREAD
        ).length,
      };
    case 'ADD_NOTIFICATION':
      return {
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.notification_status === NotificationStatus.UNREAD ? 1 : 0),
      };
    case 'REMOVE_NOTIFICATION':
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        notifications: state.notifications.filter((n) => n.id !== action.payload),
        unreadCount: state.unreadCount - (notificationToRemove?.notification_status === NotificationStatus.UNREAD ? 1 : 0),
      };
    case 'MARK_AS_READ':
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.payload
            ? { ...n, notification_status: NotificationStatus.READ }
            : n
        ),
        unreadCount: state.unreadCount - 1,
      };
    case 'MARK_ALL_AS_READ':
      return {
        notifications: state.notifications.map((n) => ({
          ...n,
          notification_status: NotificationStatus.READ,
        })),
        unreadCount: 0,
      };
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const setNotifications = useCallback((notifications: Notification[]) => {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const removeNotification = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const markAsRead = useCallback((id: number) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        ...state,
        setNotifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Helper functions for common notification types
export const useNotificationHelpers = () => {
  const { addNotification } = useNotification();

  return {
    newPurchaseRequest: (message: string, purchaseRequest?: PurchaseRequest) => {
      addNotification({
        id: Date.now(), // Temporary ID until saved to backend
        notification_type: NotificationType.NEW_PURCHASE_REQUEST,
        notification_message: message,
        notification_status: NotificationStatus.UNREAD,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
        purchase_request: purchaseRequest,
      });
    },
    newBid: (message: string, bid?: Bid) => {
      addNotification({
        id: Date.now(),
        notification_type: NotificationType.NEW_BID,
        notification_message: message,
        notification_status: NotificationStatus.UNREAD,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
        bid,
      });
    },
    message: (message: string, creator?: User) => {
      addNotification({
        id: Date.now(),
        notification_type: NotificationType.MESSAGE,
        notification_message: message,
        notification_status: NotificationStatus.UNREAD,
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
        creator,
      });
    },
    bidInvitation: (message: string, bid?: Bid) => {
      addNotification({
        id: Date.now(),
        notification_type: NotificationType.BID_INVIATION,
        notification_message: message,
        notification_status: NotificationStatus.UNREAD,
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
        bid,
      });
    },
  };
};