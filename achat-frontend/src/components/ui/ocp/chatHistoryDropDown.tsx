"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ChevronDown, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type NavigationMenuItem = {
  id: number;
  name: string;
  action: () => void;
};

const ChatHistoryDropDown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navigationMenuList, setNavigationMenuList] = useState<
    NavigationMenuItem[]
  >([]);

  useEffect(() => {
    const dataNavigationMenuList = [
      {
        id: 1,
        name: "Your Groups",
        action: () => {
          console.log(`Clicked: Your Groups`);
        },
      },
      {
        id: 2,
        name: "Chat with other suppliers",
        action: () => {
          console.log(`Clicked: Chat with other suppliers`);
        },
      },
      {
        id: 3,
        name: "Something else that can be done",
        action: () => {
          console.log(`Clicked: Something else that can be done`);
        },
      },
      {
        id: 4,
        name: "Contact support",
        action: () => {
          console.log(`Clicked: Contact support`);
        },
      },
    ];
    setNavigationMenuList(dataNavigationMenuList);
  }, []);

  return (
    <div className="flex gap-2 items-center font-semibold border-b hover:bg-zinc-50">
      <DropdownMenu
        onOpenChange={() => {
          setDropdownOpen(!dropdownOpen);
        }}
        modal={false}
      >
        <DropdownMenuTrigger className="md:p-4 p-2 w-full flex items-center md:justify-between justify-center focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-white focus:ring-opacity-0 ">
          <div className="flex 2xl:gap-2 gap-1 items-center">
            <MessageCircle
              className={cn(
                "2xl:size-5 size-4 transition-all duration-300 ease-in-out"
              )}
            />
            <h1 className="2xl:text-base text-sm hidden md:flex items-center">
              Chat
            </h1>
          </div>
          <ChevronDown
            className={cn(
              "hidden md:flex items-center 2xl:size-5 size-4 transition-all duration-300 ease-in-out",
              {
                "transform rotate-180": dropdownOpen,
              }
            )}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="md:w-[16rem] xl:w-[19rem] scale-[1] my-1 p-2 flex flex-col gap-2 duration-500 rounded">
          {navigationMenuList.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="line-clamp-1 p-2 cursor-pointer overflow-hidden"
              onClick={item.action}
            >
              {item.name}
            </DropdownMenuItem>
          ))}
          {navigationMenuList.length === 0 && (
            <h1 className="text-zinc-600 text-xxs 2xl:text-sm 2xl:p-2 p-1">
              No Actions Available.
            </h1>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHistoryDropDown;
