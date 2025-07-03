import { User } from "@/types/entities";
import { Column } from "@/components/ui/ocp/layout/OCPDataTable-new/shared/BaseDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  CircleCheck,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BelongingCompanyComponent } from "@/components/ui/ocp/layout/OCPDataTable-new/users/BelongingCompanyComponent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { StartChat } from "@/endpoints/chat/start-chat";
import { toast } from "sonner";

// Create a new component for the actions column
const ActionsCell = ({ item }: { item: User }) => {
  const { user } = useUser();
  const { mutateAsync: createChat } = StartChat();

  const handleSendMessage = async (targetUser: User) => {
    if (!user) {
      toast.error("You must be logged in to start a chat");
      return;
    }

    try {
      const data = await createChat({
        chat_name: `${targetUser.first_name} Chat`,
        chat_description: `Chat with ${targetUser.first_name} ${targetUser.last_name}`,
        chat_members: [targetUser.id],
        chat_type: "DIRECT",
      });

      if (data) {
        toast.success("Chat started successfully");
        window.open(`/dashboard/chat/${data.id}`, "_blank");
      }
    } catch (error) {
      toast.error("Failed to start chat");
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => (window.location.href = `mailto:${item.email}`)}
        >
          <Mail className="mr-2 h-4 w-4" />
          <span>Email</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => (window.location.href = `tel:${item.phone_number}`)}
        >
          <Phone className="mr-2 h-4 w-4" />
          <span>Call</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleSendMessage(item)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Message</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function getCompanyOperatorsColumns(
  t: (key: string) => string
): Column<User>[] {
  return [
    {
      header: t("headers.supplier_name"),
      accessor: "first_name",
      clickable: true,
      render: (_, item) => (
        <Link
          className="flex items-center gap-2 w-fit hover:bg-accent/50 rounded-lg transition-colors"
          href={`/dashboard/suppliers/${item.id}`}
        >
          <Avatar className="xl:size-12 relative">
            <AvatarImage
              src={item.avatar?.url || "/placeholder.webp"}
              alt={item.first_name}
            />
            <AvatarFallback>
              {item.first_name?.[0] || "-"}
              {item.last_name?.[0] || "-"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm xl:text-base font-medium">
              {item.first_name} {item.last_name}
            </span>
            <span className="text-xs xl:text-sm text-muted-foreground">
              {item.email || "-"}
            </span>
          </div>
        </Link>
      ),
    },
    {
      header: t("headers.belonging_company"),
      accessor: "companyId",
      clickable: true,
      render: (_, item) => (
        <BelongingCompanyComponent
          companyId={item.companyId || 0}
          user={item}
        />
      ),
    },
    {
      header: t("headers.status"),
      accessor: "is_active",
      clickable: true,
      render: (_, item) => {
        const statusConfig = {
          true: {
            color: "bg-green-100 text-green-800 border-green-200",
            icon: <CircleCheck className="h-3 w-3" />,
            text: "Active",
          },
          false: {
            color: "bg-red-100 text-red-800 border-red-200",
            icon: <XCircle className="h-3 w-3" />,
            text: "Inactive",
          },
        } as const;

        const config = statusConfig[item.is_active ? "true" : "false"];

        return (
          <Badge
            variant="outline"
            className={cn("capitalize flex items-center gap-1.5", config.color)}
          >
            {config.icon}
            {config.text}
          </Badge>
        );
      },
    },
    {
      header: t("headers.phone"),
      accessor: "phone_number",
      clickable: false,
    },
    {
      header: t("headers.address"),
      accessor: "address",
      clickable: false,
    },
    // {
    //   header: t("headers.business_scopes"),
    //   accessor: "business_scopes",
    //   clickable: false,
    //   render: (_, item) => (
    //     <BusinessScopesCell business_scopes={item.business_scopes || []} />
    //   ),
    // },
    {
      header: "",
      accessor: "id" as keyof User,
      clickable: false,
      render: (_, item) => <ActionsCell item={item} />,
    },
  ];
}
