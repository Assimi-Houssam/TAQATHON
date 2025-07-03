"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

const NotificationTrigger = () => {
  return (
    <DropdownMenuTrigger className="h-full" asChild>
      <Button
        size="sm"
        variant="ghost"
        className="text-gray-700 hover:text-black cursor-pointer focus-visible:ring-0 focus-visible:ring-transparent"
      >
        <Bell className="scale-[1.5]" />
      </Button>
    </DropdownMenuTrigger>
  );
};

export default NotificationTrigger;
