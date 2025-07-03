"use client";

import { Separator } from "@/components/ui/separator";
import { ReportReplyForm } from "@/components/ui/ocp/reports/report-reply-form";
import { Report, Reply } from "@/types/report";
import { format } from "date-fns";
import { useGetReport } from "@/endpoints/reports/get-report";
import { useGetReportReplies } from "@/endpoints/reports/get-report-replies";
import { ReportStatus } from "@/types/report";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ReplyAvatar } from "./reply-avatar";
import { Button } from "@/components/ui/button";

interface ReportRepliesProps {
  report: Report;
}

const waveAnimation = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" },
  },
};

export function ReportReplies({ report }: ReportRepliesProps) {
  const t = useTranslations("reports.details.replies");
  const { data: latestReport } = useGetReport(report.id);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useGetReportReplies(report.id);

  const currentReport = latestReport || report;
  const allReplies = data?.pages?.flatMap((page) => page.replies) || [];
  const totalReplies = data?.pages?.[0]?.total || 0;

  if (status === "pending") {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-green-600" />
      </div>
    );
  }

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">
            {t("title")} ({totalReplies})
          </h4>
        </div>

        {allReplies.length > 0 ? (
          <div className="space-y-6">
            {allReplies.map((reply: Reply) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex gap-3 items-start">
                  <ReplyAvatar
                    imageUrl={reply.creator?.avatar?.id || ""}
                    name={reply.creator?.username || ""}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {reply.creator?.username || ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.createdAt), "PPP 'at' p")}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{reply.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {hasNextPage && (
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full"
              >
                {isFetchingNextPage ? t("loading_more") : t("load_more")}
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait" key="closed-status">
            {currentReport.status === ReportStatus.CLOSED && (
              <motion.div
                key="closed-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative w-24 h-24 mb-6">
                  <motion.div
                    className="absolute inset-0 bg-custom-green-50 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-custom-green-600" />
                  </motion.div>
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      d="M 50 10 C 70 10 85 25 85 45 C 85 65 70 80 50 80 C 30 80 15 65 15 45 C 15 25 30 10 50 10"
                      stroke="rgba(22, 163, 74, 0.2)"
                      strokeWidth="2"
                      variants={waveAnimation}
                      initial="initial"
                      animate="animate"
                    />
                  </svg>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("closed_no_replies.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {t("closed_no_replies.description")}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {currentReport.status !== ReportStatus.CLOSED && (
          <div className="mt-6">
            <ReportReplyForm reportId={currentReport.id} />
          </div>
        )}
      </div>
    </>
  );
}
