"use client";

import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { useUser } from "@/context/user-context";
import { Chat } from "@/types/entities/index";
import { ChatInfo } from "@/types/ChatInfo";
import { generateChatInfo } from "@/lib/utils";
import Link from "next/link";

const ChatHistoryItem = ({ chat }: { chat: Chat }) => {
  const { user } = useUser();
  if (!user) return null;
  const chatInfo: ChatInfo = generateChatInfo(chat, user);
  return (
    <Link
      href={`/dashboard/chat/${chat.id}`}
      key={chat.id}
      className="flex rounded-lg select-none justify-start items-center gap-3 transition-all duration-200 p-2.5 cursor-pointer hover:bg-muted/75 w-full group"
    >
      <AvatarWithStatus
        src={chatInfo.avatar}
        fallback={chatInfo.avatarFallback}
        userId={chatInfo.userId}
        className="size-9 md:size-10 2xl:size-11 shrink-0"
      />

      <div className="hidden md:flex flex-col w-full min-w-0">
        <div className="flex justify-between items-center w-full">
          <h3 className="font-medium text-sm text-foreground truncate group-hover:text-foreground/90">
            {chatInfo.chat_name}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 pl-2">
            {chatInfo.lastMessageTime}
          </span>
        </div>
        <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">
          {chatInfo.lastMessage}
        </p>
      </div>
    </Link>
  );
};

export default ChatHistoryItem;
