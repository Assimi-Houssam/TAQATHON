"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CompanyRegistrationPendingStatus() {
  const t = useTranslations("companyRegistration");
  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-3xl shadow-md">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b pb-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-2xl text-gray-900">
              {t("title")}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Application Status: Pending Review
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              Your request to register your company with OCP Achat has been
              submitted, and is pending verification.
            </p>
            <p className="leading-relaxed">
              You will receive an email when there is an update on your request.
            </p>
            <div className="bg-amber-50 p-4 rounded-lg">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
