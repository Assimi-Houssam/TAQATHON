import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: {
    id: number;
    message: string;
    sender: string;
    isLoading: boolean;
  }[];
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, children, messages, ...props }, ref) => {
    const messageListRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTo(0, messageListRef.current.scrollHeight);
      }
    }, [messages]);

    return (
      <div
        ref={messageListRef}
        className={cn("flex flex-col w-full gap-1.5 overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
