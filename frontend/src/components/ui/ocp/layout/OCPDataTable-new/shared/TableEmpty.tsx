import { CircleX } from "lucide-react";
import { useTranslations } from "next-intl";

export function TableEmpty() {
  const t = useTranslations("dataTable");
  
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-muted p-3">
          <CircleX className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{t("noResults")}</p>
        <p className="text-sm text-muted-foreground">
          {t("tryAdjustingSearchOrFilters")}
        </p>
      </div>
    </div>
  );
} 