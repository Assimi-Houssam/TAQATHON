"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CompanyRegistrationRejectedStatus({
  rejectionReason,
  onDismiss,
}: {
  rejectionReason: string;
  onDismiss: () => void;
}) {
  const t = useTranslations("companyRegistration");
  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-3xl shadow-md border-red-200">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b pb-4">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-2xl text-gray-900">
              {t("title")}
            </h3>
            <p className="text-red-600 text-sm mt-1">
              Application Status: Rejected
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              Your request to register your company with OCP Achat has been
              rejected.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="font-medium text-red-700">
                The given reason is: {rejectionReason}
              </p>
            </div>
            <p className="leading-relaxed">
              Please review the information you provided and resubmit your
              request.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                If you have any questions, please contact us at{" "}
                <a
                  href="mailto:support@ocpachat.com"
                  className="text-primary font-medium hover:underline"
                >
                  support@ocpachat.com
                </a>
              </p>
            </div>
            <p>Thank you for your patience.</p>
            <p className="font-medium text-gray-900">OCP Achat Team</p>
            <div className="mt-8 flex justify-end">
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Submit a new request
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
