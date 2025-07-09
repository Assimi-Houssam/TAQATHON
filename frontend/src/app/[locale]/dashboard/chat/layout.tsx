"use client";
import ChatHistory from "@/components/ui/taqa/layout/chatHistory";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { socketService } from "@/endpoints/chat/ChatSocket";
import { useGetAllChats } from "@/endpoints/chat/get-user-chats";
import { getCookie } from "cookies-next/client";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  children: ReactNode;
};

function ChatPageContent({ children }: Props) {
  const t = useTranslations("chat");
  const { setChats } = useChat();
  const { data, error } = useGetAllChats();
  const socket = socketService;

  useEffect(() => {
    const token = getCookie("access_token");
    if (token) {
      socket.disconnect();
      socket.connect(token);
    }
  }, [socket]);

  useEffect(() => {
    if (error) {
      toast.error(t("error_fetching_chats"));
      return;
    }
    if (data) {
      setChats(data);
    }
  }, [data, error, setChats, t]);

  return (
    <div className="w-full h-full flex divide-x overflow-hidden text-xs 2xl:text-sm ">
      <ChatHistory className="w-full md:max-w-[24rem]" />
      <div className="flex w-full justify-center items-center p-4">{children}</div>
    </div>
  );
}

const Layout = ({ children }: Props) => {
  return (
    <ChatProvider>
      <ChatPageContent>{children}</ChatPageContent>
    </ChatProvider>
  );
};

export default Layout;
