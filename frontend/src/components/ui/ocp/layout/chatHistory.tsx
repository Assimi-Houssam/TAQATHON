"use client";

import ChatHistoryDropDown from "../chatHistoryDropDown";
import ChatHistoryItem from "../chatHistoryItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { Chat } from "@/types/entities/index";
import { ChatType } from "@/types/entities/enums/index.enum";
import { useTranslations } from "next-intl";
import { Users, UserRound, LayoutGrid, Search } from "lucide-react";

const LoadingChatComponents = () => {
  const t = useTranslations("chat");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  return (
    <div
      className={`p-2 text-zinc-500 font-light select-none flex items-center justify-center md:justify-start gap-2 ${
        loading ? "hidden" : ""
      }`}
    >
      <h1>{t("no_chat_selected")}</h1>
    </div>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const FilterButton = ({ active, onClick, icon, label }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`flex-1 px-3 py-1.5 rounded-md font-medium transition-colors border ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "text-muted-foreground hover:bg-muted/50 border-muted"
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  </button>
);

const ChatHistory = ({ className }: { className?: string }) => {
  const t = useTranslations("chat");
  const [windowHeight, setWindowHeight] = useState(0);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filterOptions)[number]["id"]>("all");
  const { chats } = useChat();

  const filteredChats = chats
    .filter((chat) => {
      const nameMatch = chat.chat_name
        .toLowerCase()
        .includes(search.toLowerCase());
      const typeMatch =
        activeFilter === "all" ||
        (activeFilter === "direct"
          ? chat.chat_type === ChatType.DIRECT
          : chat.chat_type === ChatType.GROUP);
      return nameMatch && typeMatch;
    })
    .sort((a, b) => {
      const aTime = a.last_message?.created_at
        ? new Date(a.last_message.created_at).getTime()
        : 0;
      const bTime = b.last_message?.created_at
        ? new Date(b.last_message.created_at).getTime()
        : 0;
      return bTime - aTime;
    });

  const HEADER_HEIGHT = 250;

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight - HEADER_HEIGHT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filterOptions = [
    { id: "all", icon: <LayoutGrid className="h-4 w-4" /> },
    { id: "direct", icon: <UserRound className="h-4 w-4" /> },
    { id: "group", icon: <Users className="h-4 w-4" /> },
  ] as const;

  return (
    <div className={` ${className}`}>
      <ChatHistoryDropDown />
      <div className="flex flex-col gap-2 p-2">
        <div className="w-full">
          <div className="flex items-center gap-2 px-2 rounded-md border bg-background">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder={t("search")}
              className="w-full py-2 bg-transparent outline-none text-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {filterOptions.map((option) => (
            <FilterButton
              key={option.id}
              active={activeFilter === option.id}
              onClick={() => setActiveFilter(option.id)}
              icon={option.icon}
              label={t(option.id)}
            />
          ))}
        </div>
      </div>
      <ScrollArea
        style={{
          height: `${windowHeight}px`,
        }}
        className={`w-full relative overflow-hidden p-2`}
      >
        {chats.length === 0 && <LoadingChatComponents />}
        {filteredChats.map((chat: Chat) => (
          <ChatHistoryItem chat={chat} key={chat.id} />
        ))}
      </ScrollArea>
    </div>
  );
};

export default ChatHistory;
