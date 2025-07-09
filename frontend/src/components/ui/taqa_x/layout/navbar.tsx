"use client";

import { useEffect } from "react";
import NotificationCenter from "../notificationCenter";
import SearchBar from "../searchbar";
import UserIcon from "../user-icon";
import Logo from "@/components/ui/taqa_x/logo";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
// import { useNotification } from "@/context/NotificationContext";
// import { useGetAllNotifications } from "@/endpoints/notifications/get-all-notifications";
import { toast } from "sonner";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="bg-white h-20 p-4 border-b flex items-center justify-between fixed opacity- top-0 left-0 w-full z-50">
      <div className="flex items-center md:gap-8 gap-2">
        <PanelLeft
          className="text-zinc-500 cursor-pointer size-6"
          onClick={() => toggleSidebar()}
        />
        <Logo />
      </div>
      <div className="flex flex-row-reverse items-center gap-1 px-2">
        <UserIcon />
        <NotificationCenter />
      </div>
    </div>
  );
};

export { Navbar };
