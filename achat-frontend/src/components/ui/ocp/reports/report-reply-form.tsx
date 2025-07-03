"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReply } from "@/endpoints/reports/create-reply";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { LoadingDots } from "@/components/ui/loading-dots";

interface ReportReplyFormProps {
  reportId: string;
}

export function ReportReplyForm({ reportId }: ReportReplyFormProps) {
  const t = useTranslations("reports.details.replies");
  const [replyContent, setReplyContent] = useState("");
  const createReply = useCreateReply(reportId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await createReply.mutateAsync({ message: replyContent });
      setReplyContent("");
      toast.success(t("toast_success"));
    } catch {
      toast.error(t("toast_error"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder={t("placeholder")}
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        disabled={createReply.isPending}
        required
        minLength={2}
        maxLength={1000}
      />
      <Button 
        type="submit" 
        size="sm" 
        disabled={createReply.isPending || !replyContent.trim()}
      >
        {createReply.isPending ? <LoadingDots /> : t("send")}
      </Button>
    </form>
  );
}
