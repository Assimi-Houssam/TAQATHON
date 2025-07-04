import { CreateReportDialog } from "@/components/ui/ocp/reports/create-report-dialog";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function EmptyReports() {
  const t = useTranslations("reports.empty");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto">
        <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{t("title")}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("description")}
        </p>
        <CreateReportDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
}
