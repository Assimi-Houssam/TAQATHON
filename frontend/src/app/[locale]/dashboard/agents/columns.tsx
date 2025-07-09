import { User } from "@/types/entities";
import { Column } from "@/components/ui/taqa/layout/OCPDataTable-new/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EyeIcon, Mail, MoreVertical, PhoneCall, Briefcase } from "lucide-react";

export function getAgentColumns(t: (key: string) => string): Column<User>[] {
  return [
    {
      header: t("headers.full_name"),
      accessor: "full_name",
      clickable: true,
      render: (_, item) => (
        <Link
          href={`/dashboard/profile/${item.id}`}
          className="flex items-center gap-2 w-fit hover:bg-accent/50 rounded-lg transition-colors"
        >
          <div className="relative">
            <Avatar className="xl:size-12">
              <AvatarImage
                // src={item.avatar?.url || "/placeholder.webp"}
                src={`${process.env.NEXT_PUBLIC_API_URL}/documents/avatar/${item.avatar?.id}`}
                alt={`${item.first_name} ${item.last_name}`}
              />
              <AvatarFallback>
                {item.first_name?.[0]}
                {item.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {item.status === "offline" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm xl:text-base font-medium">
              {item.first_name} {item.last_name}
            </span>
            <span className="text-xs xl:text-sm text-muted-foreground">
              {item.privilege_level}
            </span>
          </div>
        </Link>
      ),
    },
    {
      header: t("headers.phone"),
      accessor: "phone_number",
      clickable: false,
    },
    {
      header: t("headers.email"),
      accessor: "email",
      clickable: true,
    },
    {
      header: t("headers.title"),
      accessor: "title",
      clickable: true,
      hidden: true,
    },
    {
      header: t("headers.department"),
      accessor: "departements",
      clickable: true,
      hidden: true,
      render: (_, item) => (
        <div className="flex items-center gap-2 text-sm cursor-default bg-emerald-300/10 border rounded-md p-1 px-3 w-fit">
          <Briefcase className="h-4 w-4" />
          <span className="">{item.departements?.[0]?.name || "No department"}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      clickable: false,
      render: (_, item) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() =>
                  (window.location.href = `tel:${item.phone_number}`)
                }
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                <span>Call</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => (window.location.href = `mailto:${item.email}`)}
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (window.location.href = `/dashboard/profile/${item.id}`)
                }
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
