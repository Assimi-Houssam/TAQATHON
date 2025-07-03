import { User } from "@/types/entities";
import { Activity, Users, Building2, ExternalLink } from "lucide-react";
import { useGetCompanyById } from "@/endpoints/company/get-company";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface BelongingCompanyComponentProps {
  companyId: number;
  user: User;
}

export function BelongingCompanyComponent({
  companyId,
  user,
}: BelongingCompanyComponentProps) {
  const { data: company, isLoading } = useGetCompanyById(companyId);
  const t = useTranslations("operators");
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    );
  }

  const baseClasses = "flex items-center gap-2 p-2 rounded-md" + (user != null ? "" : "");

  if (!company) {
    return (
      <div className={`${baseClasses} text-muted-foreground`}>
        <Avatar className="size-8">
          <AvatarFallback>
            <Building2 className="size-4" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{t("no_company")}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/companies/${companyId}`}
      className="group relative flex items-center gap-4 rounded-lg p-2 transition-all duration-300"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 ">
        <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative">
        <Avatar className="size-12 rounded-md border shadow-sm transition-transform duration-300 ">
          <AvatarImage
            src={company.logo || "/placeholder.webp"}
            alt={company.legal_name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/5">
            <Building2 className="size-6 text-primary" />
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 max-w-[16ch] md:max-w-[24ch] line-clamp-1">
            {company.legal_name}
          </span>
          <ExternalLink className="size-3 text-slate-400 transition-colors " />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="items-center gap-1 hidden">
            <Activity className="size-3" />
            <span>Active</span>
          </div>
          <div className="h-3 w-px bg-slate-200 hidden" />
          <div className="flex items-center gap-1">
            <Users className="size-3" />
            <span>{company.members?.length || 0} members</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
