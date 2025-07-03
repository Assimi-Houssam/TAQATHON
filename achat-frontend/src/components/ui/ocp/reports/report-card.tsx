"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Report } from "@/types/report";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReportHeader } from "./report-header";
import { useTranslations } from "next-intl";

export function ReportCard({ report }: { report: Report }) {
  const t = useTranslations("reports.details");
  const router = useRouter();

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="p-4 pb-0 sm:p-6 sm:pb-0">
        <ReportHeader report={report} />
      </CardHeader>

      <CardFooter className="p-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/reports/${report.id}`)}
          className="w-full flex items-center justify-center gap-1 border-t rounded-none hover:bg-gray-50 h-8"
        >
          {t("title")} <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
