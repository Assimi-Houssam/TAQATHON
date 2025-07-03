import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from "react";
import { Chat, Message, User } from "@/types/entities";
import { socketService } from "@/endpoints/chat/ChatSocket";
import { useUser } from "./user-context";

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  typingUsers: Map<number, Set<number>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  updateChatLastMessage: (chatId: number, message: Message) => void;
  markUserAsTyping: (chatId: number, userId: number, isTyping: boolean) => void;
  isUserTyping: (chatId: number, userId: number) => boolean;
  getTypingUsersForChat: (chatId: number) => User[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<number>>>(new Map());
  const { user } = useUser();

  const updateChatLastMessage = useCallback((chatId: number, message: Message) => {
    setChats((prevChats) => {
      return prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            last_message: message,
          };
        }
        return chat;
      });
    });
  }, []);

  const markUserAsTyping = useCallback((chatId: number, userId: number, isTyping: boolean) => {
    setTypingUsers((prev) => {
      const newMap = new Map(prev);
      let chatTypingUsers = newMap.get(chatId);
      
      if (!chatTypingUsers) {
        chatTypingUsers = new Set();
        newMap.set(chatId, chatTypingUsers);
      }

      if (isTyping) {
        chatTypingUsers.add(userId);
      } else {
        chatTypingUsers.delete(userId);
      }

      return newMap;
    });
  }, []);

  const isUserTyping = useCallback((chatId: number, userId: number) => {
    return typingUsers.get(chatId)?.has(userId) || false;
  }, [typingUsers]);

  const getTypingUsersForChat = useCallback((chatId: number) => {
    const chat = chats.find((c) => c.id === chatId);
    const typingUserIds = typingUsers.get(chatId) || new Set();
    return (
      chat?.chat_members?.filter((member) => 
        typingUserIds.has(member.id) && member.id !== user?.id
      ) || []
    );
  }, [chats, typingUsers, user?.id]);

  useEffect(() => {
    const socket = socketService;
    
    socket.onTypingChange((userId, chatId, isTyping) => {
      markUserAsTyping(chatId, userId, isTyping);
    });

    return () => {
      socket.removeStatusListeners();
    };
  }, [markUserAsTyping]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        typingUsers,
        setChats,
        setCurrentChat,
        updateChatLastMessage,
        markUserAsTyping,
        isUserTyping,
        getTypingUsersForChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
