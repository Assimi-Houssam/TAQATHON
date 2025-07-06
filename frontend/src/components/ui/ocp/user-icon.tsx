"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/user-context";
import { useLogoutMutation } from "@/endpoints/auth/auth";
import { useRouter } from "next/navigation";

const UserIcon = () => {
  const { user, isLoading, isError } = useUser();
  const router = useRouter();
  const logoutMutation = useLogoutMutation();

  if (isLoading || !user) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  // Get user initials for fallback
  const initials = user.username
    .split(" ")
    .map((name: string) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity px-2 py-1 rounded-lg hover:bg-gray-100">
          <Avatar className="focus-visible:ring-0 focus-visible:ring-transparent size-10 border border-gray-200 aspect-square object-cover">
            <AvatarImage
              className="object-cover"
              src={
                user.avatar
                  ? `${process.env.NEXT_PUBLIC_API_URL}/documents/avatar/${user.avatar.id}`
                  : undefined
              }
              alt={`${user.username}'s avatar`}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className=" font-medium text-gray-700">{user.username}</span>
            {user.email && (
              <span className="text-xs text-gray-500">{user.email}</span>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-gray-200 rounded-md shadow-lg p-1 mr-2">
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/profile/${user.id}`)}
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={() => {
            logoutMutation.mutate();
          }}
          disabled={isError}
          className="flex items-center gap-2 p-2 hover:bg-red-50 rounded-md cursor-pointer text-red-600 hover:text-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserIcon;
