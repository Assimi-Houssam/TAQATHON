"use client";

import { ChatInfo } from "@/types/ChatInfo";
import { Chat } from "@/types/entities";
import { useParams } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { useGetChatMessages } from "@/endpoints/chat/get-chat-messages";
import React, { useEffect } from "react";
import ChatMessaging from "@/components/ui/ocp/layout/chatMessaging";
import { useUser } from "@/context/user-context";
import { generateChatInfo } from "@/lib/utils";

const Page = () => {
  const { chats } = useChat();
  const { id } = useParams();
  const { user } = useUser();
  const { data: chatMessages, refetch } = useGetChatMessages(Number(id));
  const [chat, setChat] = React.useState<Chat | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch, id]);

  useEffect(() => {
    if (chats && chats.length > 0 && chatMessages) {
      const chat = chats.find((chat) => chat.id === Number(id));
      if (!chat) {
        return;
      }
      chat.messages = chatMessages.messages;
      setChat(chat);
    }
  }, [chats, chatMessages, id]);

  if (!chat || !user) {
    return null;
  }

  const chatInfo: ChatInfo = generateChatInfo(chat, user);
  return <ChatMessaging chatInfo={chatInfo} chat={chat} />;
};

export default Page;
