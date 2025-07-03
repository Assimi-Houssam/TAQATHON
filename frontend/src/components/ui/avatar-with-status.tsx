'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { socketService } from "@/endpoints/chat/ChatSocket";
import { useEffect, useState } from "react";

interface AvatarWithStatusProps {
  src?: string;
  fallback: string;
  userId: number;
  className?: string;
}

export function AvatarWithStatus({
  src,
  fallback,
  userId,
  className,
}: AvatarWithStatusProps) {
  const [isOnline, setIsOnline] = useState(socketService.isUserOnline(userId));

  useEffect(() => {
    const handleStatusChange = (changedUserId: number, status: 'online' | 'offline') => {
      if (changedUserId === userId) {
        setIsOnline(status === 'online');
      }
    };

    socketService.onStatusChange(handleStatusChange);

    return () => {
      socketService.removeStatusListeners();
    };
  }, [userId]);

  return (
    <div className="relative">
      <Avatar className={className}>
        <AvatarImage src={src} alt={fallback} />
        <AvatarFallback className="bg-custom-green-300 text-white font-medium">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
          isOnline ? 'bg-green-500' : 'bg-gray-300'
        )}
      />
    </div>
  );
}
