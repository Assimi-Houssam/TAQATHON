"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReport } from "@/endpoints/reports/create-report";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoadingDots } from "@/components/ui/loading-dots";

interface CreateReportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateReportDialog({
  open,
  onOpenChange,
}: CreateReportDialogProps) {
  const t = useTranslations("reports.create");
  const createReport = useCreateReport();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      await createReport.mutateAsync({ title, description });
      onOpenChange?.(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" />
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={t("form.title.placeholder")}
            name="title"
            required
            disabled={createReport.isPending}
            minLength={3}
            maxLength={100}
          />
          <Textarea
            placeholder={t("form.description.placeholder")}
            name="description"
            required
            disabled={createReport.isPending}
            minLength={5}
            maxLength={1000}
          />
          <Button type="submit" disabled={createReport.isPending}>
            {createReport.isPending ? <LoadingDots /> : t("form.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
