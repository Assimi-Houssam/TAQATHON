import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  BookCheck,
  UserRoundPen,
  Building2,
} from "lucide-react";

interface ActionBadgeProps {
  type: string;
}

const setActionColor = (type: string) => {
  let color = "white";
  let icon: React.ReactNode;
  switch (type) {
    case "OCP_AGENT":
      color = "green";
      icon = <UserRoundPen className="size-4" />;
      break;
    case "Feedback":
      color = "blue";
      icon = <MessageCircle className="size-4" />;
      break;
    case "Bid":
      color = "green";
      icon = <BookCheck className="size-4" />;
      break;
    case "Purchase Request":
      color = "yellow";
      icon = <BookCheck className="size-4" />;
      break;
    case "Profile":
      color = "purple";
      icon = <BookCheck className="size-4" />;
      break;
    case "Company":
      color = "red";
      icon = <Building2 className="size-4" />;
      break;
  }
  return {
    color,
    icon,
  };
};

const ActionBadge: React.FC<ActionBadgeProps> = ({ type }) => {
  let color = "white";
  const text = type === "OCP_AGENT" ? "OCP Agent" : type;

  color = setActionColor(type).color;

  return (
    <Badge
      variant={"outline"}
      className={`bg-${color}-50 text-${color}-700 px-4 py-1 w-fit cursor-default line-clamp-1`}
    >
      {text}
    </Badge>
  );
};
const ActionBadgeIcon: React.FC<ActionBadgeProps & { className?: string }> = ({ type, className }) => {
  let color = "white";
  color = setActionColor(type).color;
  const icon = setActionColor(type).icon;

  return (
    <Badge
      variant={"outline"}
      className={`bg-${color}-50 text-${color}-700 border-${color}-200 p-2 w-fit cursor-default line-clamp-1 rounded-full ${className}`}
    >
      {icon}
    </Badge>
  );
};

export { ActionBadge, ActionBadgeIcon };
