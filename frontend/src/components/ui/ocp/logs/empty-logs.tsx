"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";

export function EmptyLogs() {
  const t = useTranslations("logs");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="p-4 bg-custom-green-50 rounded-full w-fit mx-auto">
          <FileText className="w-8 h-8 text-custom-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {t("empty.title")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("empty.description")}
        </p>
      </div>
    </div>
  );
}
