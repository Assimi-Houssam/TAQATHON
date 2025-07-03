"use client";

const actionIcons = [{ icon: Copy, type: "Copy" }];
import { Chat, User } from "@/types/entities";
import { useState, useRef } from "react";
import clsx from "clsx";
import { SendHorizontal, Copy } from "lucide-react";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import ChatMessagingInfo from "@/components/ui/ocp/chatMessagingInfo";
import { ChatInfo } from "@/types/ChatInfo";
import { useUser } from "@/context/user-context";
import { socketService } from "@/endpoints/chat/ChatSocket";
import { SentMessage } from "@/types/SentMessagePaylod";
import { useTranslations } from "next-intl";
import { useChat } from "@/context/ChatContext";
import { useChatMessages } from "@/hooks/useChatMessages";

const TYPING_DEBOUNCE_MS = 1000;

const ChatMessagingDM = ({
  chat,
  chatInfo,
}: {
  chat: Chat;
  chatInfo: ChatInfo;
}) => {
  const t = useTranslations("chat");
  const [userInput, setUserInput] = useState("");
  const { user } = useUser();
  const socket = socketService;
  const { getTypingUsersForChat } = useChat();
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const {
    messages,
    messageListRef,
    topRef,
    isFetchingNextPage,
    status,
  } = useChatMessages(chat.id);

  const typingUsers = getTypingUsersForChat(chat.id);

  const emitTyping = (isTyping: boolean) => {
    if (user) {
      socket.emitTyping(chat.id, user.id, isTyping);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    emitTyping(true);

    // Set timeout to emit typing end
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, TYPING_DEBOUNCE_MS);
  };

  async function handleSendMessage(
    chatId: number,
    content: string,
    sender_id: number
  ) {
    if (!content.trim()) return;

    const payload: SentMessage = {
      chat_id: chatId,
      message: {
        sender_id: sender_id,
        content: content.trim(),
      },
    };
    socket.emit("sendMessage", payload);
    setUserInput("");
    emitTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }

  if (status === "error") {
    toast.error(t("error_loading_messages"));
    return null;
  }

  return (
    <ChatMessageList
      ref={messageListRef}
      className="min-h-64 2xl:pb-40 pb-36"
      messages={messages.map((message) => ({
        id: message.id,
        message: message.content,
        sender: message.sender.username,
        isLoading: false,
      }))}
    >
      {/* Load more trigger */}
      <div ref={topRef} className="h-4">
        {isFetchingNextPage && (
          <div className="text-center text-sm text-muted-foreground">
            {t("loading_more_messages")}
          </div>
        )}
      </div>

      <ChatMessagingInfo chatInfo={chatInfo} />

      {messages.map((message) => {
        const displayDate = new Date(message.created_at)
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(",", " -");

        const sender: User = message.sender;
        const variant = sender.id === user?.id ? "sent" : "received";

        return (
          <ChatBubble
            className="2xl:max-w-[50rem] mx-3"
            key={message.id}
            variant={variant}
            layout="default"
          >
            <Avatar>
              <AvatarImage src={sender.avatar?.url} alt={sender.username} />
              <AvatarFallback>
                {sender.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ChatBubbleMessage isLoading={false}>
              {message.content}
            </ChatBubbleMessage>
            <ChatBubbleActionWrapper>
              {actionIcons.map(({ icon: Icon, type }) => (
                <ChatBubbleAction
                  className="size-8 group"
                  key={type}
                  icon={<Icon />}
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    toast.success(t("message_copied"));
                  }}
                />
              ))}
            </ChatBubbleActionWrapper>
            <div
              className={clsx(
                "text-xxs text-gray-400 w-full min-w-64 absolute -top-4 2xl:-top-5 select-none opacity-0 group-hover:opacity-100 transition-all duration-150",
                variant === "sent"
                  ? "text-right pr-9 2xl:pr-10"
                  : "text-left pl-9 2xl:pl-10"
              )}
            >
              {displayDate}
            </div>
          </ChatBubble>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="text-sm text-muted-foreground italic px-4">
          {typingUsers.length === 1
            ? t("user_is_typing", { username: typingUsers[0].username })
            : t("users_are_typing", {
                count: typingUsers.length,
              })}
        </div>
      )}

      <div className="flex items-center gap-4 absolute bottom-0 w-full 3xl:h-44 h-32 bg-white">
        <ChatInput
          placeholder={t("type_message")}
          className="h-full resize-none shadow-none focus-visible:ring-0 p-3 border rounded-lg"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSendMessage(chat.id, userInput, user?.id || 0);
            }
          }}
        />
        <div className="flex items-center absolute bottom-6 right-6">
          <Button
            onClick={() => {
              handleSendMessage(chat.id, userInput, user?.id || 0);
            }}
            size="lg"
            className="flex"
            disabled={!userInput.trim()}
          >
            <SendHorizontal className="" />
          </Button>
        </div>
      </div>
    </ChatMessageList>
  );
};

const ChatMessaging = ({
  chat,
  chatInfo,
}: {
  chat: Chat;
  chatInfo: ChatInfo;
}) => {
  if (!chat) {
    return null;
  }

  return (
    <div className="w-full flex flex-col justify-between h-full relative">
      <ChatMessagingDM chat={chat} chatInfo={chatInfo} />
    </div>
  );
};

export default ChatMessaging;
