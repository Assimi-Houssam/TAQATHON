"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatInfo } from "@/types/ChatInfo";

const ChatMessagingInfo = ({ chatInfo }: { chatInfo: ChatInfo }) => {
  return (
    <div className="p-4 flex 2xl:gap-2 flex-col items-center">
      <Avatar className="2xl:size-24 size-16">
        <AvatarImage src={chatInfo.avatar} alt="@shadcn" />
        <AvatarFallback className="2xl:text-4xl text-xl font-thin">
          {chatInfo.avatarFallback}
        </AvatarFallback>
      </Avatar>
      <h1 className="2xl:text-xl text-base font-semibold">
        {chatInfo.chat_name}
      </h1>
      <p className="2xl:text-sm text-[0.6rem] font-light text-gray-700 max-w-80 text-center line-clamp-1">
        {"Something should be here"}
      </p>
    </div>
  );
};

export default ChatMessagingInfo;
