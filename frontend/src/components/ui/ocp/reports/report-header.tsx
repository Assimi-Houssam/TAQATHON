import { Report, ReportStatus } from "@/types/report";
import { safeFormat, safeFormatDistance } from "@/lib/utils/date";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReportHeaderProps {
  report: Report;
}

type StatusType = "all" | "open" | "in_progress" | "resolved" | "closed";

const getStatusStyles = (status: string) => {
  switch (status) {
    case ReportStatus.OPEN:
      return {
            dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
      };
    case ReportStatus.IN_PROGRESS:
      return {
        dot: "bg-yellow-500",
        badge: "bg-yellow-50 text-yellow-700",
      };
    case ReportStatus.RESOLVED:
      return {
        dot: "bg-purple-500",
        badge: "bg-purple-50 text-purple-700",
      };
    case ReportStatus.CLOSED:
      return {
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-700",
      };
    default:
      return {
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-700",
      };
  }
};

export function ReportHeader({ report }: ReportHeaderProps) {
  const t = useTranslations("reports");
  const statusStyles = getStatusStyles(report.status);
  const status = report.status.toLowerCase() as StatusType;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${statusStyles.dot}`} />
          <h3 className="text-lg font-semibold">{report.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{report.description}</p>
        <div className="flex items-center gap-2 my-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {t("details.created_on")}{" "}
            <span className="font-medium">
              {safeFormat(report.createdAt, "MMM d, yyyy 'at' h:mm a", "Invalid date")}
            </span>{" "}
            {t("details.by")}{" "}
            <span className="font-medium">{report.creator.username}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles.badge}`}
        >
          {t(`filters.status.${status}`)}
        </div>
        {report.updatedAt && report.updatedAt !== report.createdAt && (
          <div className="text-xs text-muted-foreground">
            {t("details.updated")}{" "}
            {safeFormatDistance(report.updatedAt, new Date(), {
              addSuffix: true,
            }, "Invalid date")}
          </div>
        )}
      </div>
    </div>
  );
}
