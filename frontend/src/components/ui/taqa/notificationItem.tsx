"use client";

//
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
//
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Rating from "@/components/ui/ratings";

interface Notification {
  avatar?: string;
  title?: string;
  type?: string;
  stars?: number;
  message?: string;
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
  return (
    <DropdownMenuItem className="hover:bg-gray-100 rounded-none cursor-pointer p-3 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <Avatar className="cursor-pointer focus-visible:ring-0 focus-visible:ring-transparent size-10">
          <AvatarImage
            // src={notification.avatar}
            src="https://avatars.githubusercontent.com/u/124599?v=4"
            alt="User Avatar"
          />
          <AvatarFallback>
            {notification.title?.slice(0, 2).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="">
          <h1 className="font-thin text-xs">{notification.type}</h1>
          <div className="flex items-center gap-2">
            <h1>{notification.title}</h1>
            {notification.stars !== undefined && (
              <Rating value={notification.stars % 5} onChange={() => {}} />
            )}
          </div>
          <div className="font-light text-xs line-clamp-1">
            {notification.message}
          </div>
        </div>
      </div>
      <div className="text-xs font-thin min-w-fit">1m ago</div>
    </DropdownMenuItem>
  );
};

export default NotificationItem;
