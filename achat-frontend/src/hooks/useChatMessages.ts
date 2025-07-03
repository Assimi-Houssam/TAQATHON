import { useState, useCallback, useEffect, useRef } from "react";
import { Message } from "@/types/entities";
import { useGetChatMessages } from "@/endpoints/chat/get-chat-messages";
import { socketService } from "@/endpoints/chat/ChatSocket";
import { useInView } from "react-intersection-observer";

export function useChatMessages(chatId: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);
  const { ref: topRef, inView } = useInView({ threshold: 0 });
  const socket = socketService;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGetChatMessages(chatId);

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
    }
  }, [data?.messages]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    socket.on("messageSent", (message: unknown) =>
      addMessage(message as Message)
    );

    return () => {
      socket.off("messageSent");
    };
  }, [socket, addMessage]);

  return {
    messages,
    messageListRef,
    topRef,
    isFetchingNextPage,
    status,
    addMessage,
  };
}
