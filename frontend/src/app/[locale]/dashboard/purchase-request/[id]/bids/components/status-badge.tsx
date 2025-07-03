import { Badge, BadgeProps } from "@/components/ui/badge";
import { PurchaseRequestStatus } from "@/types/entities/enums/index.enum";
import { Archive, CheckCircle, Clock, HelpCircle } from "lucide-react";

interface StatusBadgeProps {
  status: PurchaseRequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<
    PurchaseRequestStatus,
    { icon: React.ElementType; variant: string }
  > = {
    [PurchaseRequestStatus.PUBLISHED]: {
      icon: CheckCircle,
      variant: "success",
    },
    [PurchaseRequestStatus.LOCKED]: {
      icon: Archive,
      variant: "secondary",
    },
    [PurchaseRequestStatus.CANCELED]: {
      icon: Clock,
      variant: "destructive",
    },
    [PurchaseRequestStatus.DRAFT]: {
      icon: Clock,
      variant: "secondary",
    },
    [PurchaseRequestStatus.WAITING_FOR_SELECTION]: {
      icon: Clock,
      variant: "warning",
    },
    [PurchaseRequestStatus.WAITING_FOR_APPROVAL]: {
      icon: Archive,
      variant: "secondary",
    },
    [PurchaseRequestStatus.FINISHED]: {
      icon: Archive,
      variant: "secondary",
    },
    [PurchaseRequestStatus.REJECTED]: {
      icon: Archive,
      variant: "secondary",
    },
    [PurchaseRequestStatus.SCHEDULED]: {
      icon: Clock,
      variant: "secondary",
    },
  } as const;

  const config = statusConfig[status] ?? {
    icon: HelpCircle,
    variant: "default"
  };

  const { icon: Icon, variant } = config;

  return (
    <Badge variant={variant as BadgeProps["variant"]} className="capitalize">
      <Icon className="mr-1 h-3 w-3" />
      {status?.toLowerCase() ?? "unknown"}
    </Badge>
  );
}
