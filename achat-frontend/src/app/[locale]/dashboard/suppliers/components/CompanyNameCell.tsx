import { Company } from "@/types/entities";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompanyStatus } from "@/types/entities/enums/index.enum";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CompanyNameCell = ({ company }: { company: Company }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case CompanyStatus.ACTIVE:
        return {
          icon: ShieldCheck,
          color: "text-green-500 fill-green-100",
          tooltip: "Active Company",
        };
      case CompanyStatus.LOCKED:
        return {
          icon: ShieldAlert,
          color: "text-yellow-500 fill-yellow-100",
          tooltip: "Suspended Company",
        };
      default:
        return {
          icon: Shield,
          color: "text-gray-400 fill-gray-50",
          tooltip: "Status Unknown",
        };
    }
  };

  const statusConfig = getStatusIcon(company.active_status);
  const StatusIcon = statusConfig.icon;

  return (
    <Link
      href={`/dashboard/suppliers/${company.id}`}
      className="inline-flex items-center gap-4 group px-1 py-2 hover:bg-gray-50 rounded-md transition-colors"
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-gray-100 shadow-sm">
          {company.logo ? (
            <Image
              src={company.logo}
              alt={company.commercial_name}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <span className="text-base font-semibold text-gray-700">
              {company.commercial_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5">
                <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusConfig.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-gray-900 truncate group-hover:text-black transition-colors max-w-[14ch]">
          {company.commercial_name}
        </span>
        {company.legal_name && (
          <span className="text-xs text-muted-foreground truncate max-w-[20ch]">
            {company.legal_name}
          </span>
        )}
      </div>
    </Link>
  );
};
