"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReportHeader } from "@/components/ui/taqa/reports/report-header";
import { ReportReplies } from "@/components/ui/taqa/reports/report-replies";
import { useGetReport } from "@/endpoints/reports/get-report";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatDistance } from "date-fns";
import { ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { ReportStatus } from "@/types/report";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import ReportStatusSelect from "@/components/reports/ReportStatusSelect";
import { useUpdateReportStatus } from "@/endpoints/reports/update-report-status";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export default function ReportPage({ params }: ReportPageProps) {
  const t = useTranslations("reports.details");
  const { id: reportId } = use(params);
  const { data: report, isLoading, error } = useGetReport(reportId);
  const updateStatus = useUpdateReportStatus();

  if (isLoading) return <LoadingSpinner />;

  if (error || !report) {
    return notFound();
  }

  const isStatusDisabled = report.status === ReportStatus.CLOSED;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={slideIn}
        className="mb-6"
      >
        <Link href="/dashboard/reports">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 group transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            {t("go_back")}
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="p-4 sm:p-6">
            <ReportHeader report={report} />
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {report.status !== ReportStatus.CLOSED && (
                <motion.div
                  key="status-select"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                  className="flex items-center justify-end"
                >
                  <ReportStatusSelect
                    reportId={reportId}
                    currentStatus={report.status}
                    disabled={isStatusDisabled}
                    updateStatus={updateStatus}
                  />
                </motion.div>
              )}

              {report.updatedAt && report.updatedAt !== report.createdAt && (
                <motion.div
                  key="update-time"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Clock className="h-4 w-4" />
                  <p>
                    {t("updated")}{" "}
                    <span className="font-medium">
                      {formatDistance(new Date(report.updatedAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ReportReplies report={report} />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
