import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Chat, User } from "@/types/entities/index";
import { ChatInfo } from "@/types/ChatInfo";
import { ChatType } from "@/types/entities/enums/index.enum";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const findOtherMember = (chat: Chat, userId: number | undefined) => {
  return chat.chat_members?.find((member) => userId && member.id !== userId);
};

export const generateChatInfo = (chat: Chat, user: User) => {
  const otherMember =
    chat.chat_type == ChatType.DIRECT ? findOtherMember(chat, user?.id) : null;

  const chatInfo: ChatInfo = {
    chat_name: otherMember?.username || chat.chat_name || "",
    avatar: otherMember?.avatar?.url || "",
    avatarFallback: otherMember
      ? otherMember.username?.slice(0, 2)?.toUpperCase() || "N/A"
      : "OCP",
    lastMessage: chat.last_message?.content || "-",
    userId: otherMember?.id || 0,
    lastMessageTime: chat.last_message?.created_at
      ? new Date(chat.last_message.created_at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : undefined,
  };
  return chatInfo;
};
