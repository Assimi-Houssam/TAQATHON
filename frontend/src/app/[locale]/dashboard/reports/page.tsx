"use client";

import { CreateReportDialog } from "@/components/ui/ocp/reports/create-report-dialog";
import { ReportCard } from "@/components/ui/ocp/reports/report-card";
import { EmptyReports } from "@/components/ui/ocp/reports/empty-reports";
import { ReportsFilters } from "@/components/ui/ocp/reports/reports-filters";
import { ReportsPagination } from "@/components/ui/ocp/reports/reports-pagination";
import { NoResults } from "@/components/ui/ocp/reports/no-results";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useGetReports } from "@/endpoints/reports/get-reports";
import { Report } from "@/types/report";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ReportsPage() {
  const t = useTranslations("reports");
  const searchParams = useSearchParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const queryParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: 5,
    status: searchParams.get("status") || undefined,
  };

  const reportsQuery = useGetReports(queryParams);
  const reports = reportsQuery.data?.reports || [];
  const totalItems = reportsQuery.data?.total || 0;
  const totalPages = Math.ceil(totalItems / queryParams.limit);

  if (
    reports.length === 0 &&
    queryParams.status === undefined &&
    !reportsQuery.isLoading
  ) {
    return <EmptyReports />;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-center">{t("title")}</h1>
      </motion.div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {reportsQuery.isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-between items-center mb-4"
            >
              <ReportsFilters />
              <CreateReportDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              />
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {reports.length ? (
                reports.map((report: Report) => (
                  <motion.div
                    key={report.id}
                    variants={item}
                    transition={{ duration: 0.3 }}
                  >
                    <ReportCard report={report} />
                  </motion.div>
                ))
              ) : (
                <NoResults />
              )}
            </motion.div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ReportsPagination totalPages={totalPages} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
