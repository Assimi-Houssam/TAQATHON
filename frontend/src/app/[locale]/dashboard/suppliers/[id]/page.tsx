"use client";

import { HistoryComponent } from "@/components/ui/taqa/HistoryComponent";
import { EntityComponent } from "@/components/ui/taqa/layout/ProfileCompanies/EntityComponent";
import { useGetCompanyById } from "@/endpoints/company/get-company";
import { Company } from "@/types/entities";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface CompanyProfileProps {
  company: Company;
}

function CompanyProfile({ company }: CompanyProfileProps) {
  return (
    <div className="flex p-6 flex-col xl:flex-row w-full h-full gap-4 2xl:gap-4 *:rounded-lg bg-white">
      <EntityComponent entity={company} />
      <HistoryComponent type="company" profile={company} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex p-6 flex-col xl:flex-row w-full h-full gap-4 2xl:gap-4 *:rounded-lg bg-white">
      <div className="w-full xl:w-1/2 space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full xl:w-1/2 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "p-4 rounded-lg border space-y-3",
                "animate-pulse",
                `[animation-delay:${i * 200}ms]`
              )}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const t = useTranslations("companies");
  const params = useParams();
  const id = params?.id as string;

  const {
    data: company,
    error,
    isLoading,
  } = useGetCompanyById(parseInt(id) || 0);

  useEffect(() => {
    if (error) {
      toast.error(t("error_fetching_company"));
    }
  }, [error, t, id]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("invalid_company_id")}</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("company_not_found")}</p>
      </div>
    );
  }

  return <CompanyProfile company={company} />;
}
