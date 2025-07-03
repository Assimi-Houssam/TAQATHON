"use client";

import { useEffect } from "react";
import NotificationCenter from "../notificationCenter";
import SearchBar from "../searchbar";
import UserIcon from "../user-icon";
import Logo from "@/components/ui/ocp/logo";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { useGetAllNotifications } from "@/endpoints/notifications/get-all-notifications";
import { toast } from "sonner";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const { setNotifications } = useNotification();
  const { data: notifications, isError } = useGetAllNotifications();

  useEffect(() => {
    if (notifications) {
      setNotifications(notifications.pages.flatMap((page) => page.data));
    }
  }, [notifications, setNotifications]);

  if (isError) {
    toast.error("Failed to fetch notifications");
  }

  return (
    <div className="bg-white h-20 p-4 border-b flex items-center justify-between fixed opacity- top-0 left-0 w-full z-50">
      <div className="flex items-center md:gap-8 gap-2">
        <PanelLeft
          className="text-zinc-500 cursor-pointer size-6"
          onClick={() => toggleSidebar()}
        />
        <Logo />
        <div className="xl:flex hidden items-center gap-16">
          <SearchBar />
        </div>
      </div>
      <div className="flex flex-row-reverse items-center gap-4">
        <UserIcon />
        <NotificationCenter />
      </div>
    </div>
  );
};

export { Navbar };
