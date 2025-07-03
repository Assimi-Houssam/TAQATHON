import { Company } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { CompanyStatus } from "@/types/entities/enums/index.enum";
import { AlertCircle, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  CompanyStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  [CompanyStatus.ACTIVE]: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CircleCheck className="h-3.5 w-3.5" />,
    label: "Active",
  },
  [CompanyStatus.LOCKED]: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    label: "Blocked",
  },
};

export function CompanyStatusCell({ company }: { company: Company }) {
  const config = statusConfig[company.active_status || CompanyStatus.ACTIVE];

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize flex items-center gap-1.5 px-2.5 py-1",
        config.color
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
