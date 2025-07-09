"use client";

import { LogCard } from "@/components/ui/taqa/logs/log-card";
import { EmptyLogs } from "@/components/ui/taqa/logs/empty-logs";
import { LogsFilters } from "@/components/ui/taqa/logs/logs-filters";
import { useGetLogs } from "@/endpoints/logs/get-all-logs";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { LogsType } from "@/types/entities/Logs.interface";
import { motion } from "framer-motion";
import { LogsNoResults } from "@/components/ui/taqa/logs/no-results";

export default function LogsPage() {
  const t = useTranslations("logs");
  const searchParams = useSearchParams();

  const actionType = searchParams.get("actionType");

  const queryParams = {
    page: Number(searchParams.get("page")) || 1,
    limit: 10,
    actionType: actionType ? (actionType as LogsType) : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    search: searchParams.get("search") || undefined,
  };

  const logsQuery = useGetLogs(queryParams);
  const logs = logsQuery.data?.logs || [];

  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = format(new Date(log.created_at), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, typeof logs>);

  if (
    !logs.length &&
    !logsQuery.isLoading &&
    !queryParams.actionType &&
    !queryParams.startDate &&
    !queryParams.endDate &&
    !queryParams.search
  ) {
    return <EmptyLogs />;
  }

  return (
    <motion.div
      className="container mx-auto py-6 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-center">{t("title")}</h2>
        <p className="text-muted-foreground text-center">
          View all activity and changes in your account
        </p>
      </motion.div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6">
          <LogsFilters />
        </div>

        {logsQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : logs.length ? (
          <div className="space-y-4">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date} className="bg-white rounded-lg overflow-hidden">
                <h2 className="text-md font-medium text-muted-foreground sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
                  {format(new Date(date), "PPPP")}
                </h2>
                {dateLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    className="p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    <LogCard
                      log={log}
                      isLast={index === dateLogs.length - 1}
                      index={index}
                    />
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <LogsNoResults />
        )}
      </div>
    </motion.div>
  );
}
