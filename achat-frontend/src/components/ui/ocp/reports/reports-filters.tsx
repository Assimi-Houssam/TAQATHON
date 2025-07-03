import { ReportStatus } from "@/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type StatusType = "all" | "open" | "in_progress" | "resolved" | "closed";

export function ReportsFilters() {
  const t = useTranslations("reports.filters.status");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const statuses = Object.values(ReportStatus);

  return (
    <div className="flex items-center gap-4">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("all")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("all")}</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {t(status.toLowerCase() as StatusType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
