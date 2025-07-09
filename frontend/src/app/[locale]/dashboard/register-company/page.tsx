"use client";
import CompanyRegistrationForm from "@/components/ui/taqa/form/company/company-register";
import CompanyRegistrationPendingStatus from "@/components/ui/taqa/form/company/company-register-pending";
import CompanyRegistrationRejectedStatus from "@/components/ui/taqa/form/company/company-register-rejected";
import CompanyRegistrationSkeleton from "@/components/ui/taqa/form/company/company-register-skeleton";
import { StepperProvider } from "@/context/stepper-context";
import { useUser } from "@/context/user-context";
import { useGetUserCompanies } from "@/endpoints/user/get-companies";
import { CompanyApprovalStatus } from "@/types/entities/enums/index.enum";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterCompany() {
  const t = useTranslations("companyRegistration");
  const { user } = useUser();
  const { data: userCompanies, isLoading: isLoadingUserCompanies } =
    useGetUserCompanies(user?.id);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const renderContent = () => {
    if (isLoadingUserCompanies) {
      return <CompanyRegistrationSkeleton />;
    }
    switch (userCompanies?.approval_status) {
      case CompanyApprovalStatus.WAITING_APPROVAL:
        return <CompanyRegistrationPendingStatus />;

      case CompanyApprovalStatus.REJECTED:
        return showForm ? (
          <StepperProvider>
            <div className="w-full mx-auto space-y-6 p-8 bg-white h-full">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {t("title")}
              </h2>
              <CompanyRegistrationForm />
            </div>
          </StepperProvider>
        ) : (
          <CompanyRegistrationRejectedStatus
            onDismiss={() => setShowForm(true)}
            rejectionReason={userCompanies?.rejection_reason}
          />
        );
      case CompanyApprovalStatus.CREATED:
        router.push("/dashboard");
        break;
      default:
        return (
          <StepperProvider>
            <div className="w-full mx-auto space-y-6 p-8 bg-white h-full">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {t("title")}
              </h2>
              <CompanyRegistrationForm />
            </div>
          </StepperProvider>
        );
    }
  };

  return <div className="w-full h-full gap-8">{renderContent()}</div>;
}
