"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ReportStatus } from "@/types/report";
import { useTranslations } from "next-intl";

interface ReportStatusSelectProps {
  reportId: string;
  currentStatus: ReportStatus;
  disabled: boolean;
  updateStatus: {
    mutate: (
      arg: { id: string; status: ReportStatus },
      options: {
        onSuccess: () => void;
        onError: () => void;
      }
    ) => void;
  };
}

const statusTranslationKeys = {
  [ReportStatus.OPEN]: "open",
  [ReportStatus.IN_PROGRESS]: "in_progress",
  [ReportStatus.RESOLVED]: "resolved",
  [ReportStatus.CLOSED]: "closed",
} as const;

export default function ReportStatusSelect({
  reportId,
  currentStatus,
  disabled,
  updateStatus,
}: ReportStatusSelectProps) {
  const t = useTranslations("reports");
  const handleStatusChange = (value: ReportStatus) => {
    updateStatus.mutate(
      { id: reportId, status: value },
      {
        onSuccess: () => {
          toast.success(t("details.status_update_success"));
        },
        onError: () => {
          toast.error(t("details.status_update_error"));
        },
      }
    );
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t("details.select_status")} />
      </SelectTrigger>
      <SelectContent>
        {Object.values(ReportStatus).map((status) => (
          <SelectItem key={status} value={status} disabled={disabled}>
            {t(`filters.status.${statusTranslationKeys[status]}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
