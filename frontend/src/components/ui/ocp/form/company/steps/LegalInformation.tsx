"use client";
import { apiClient } from "@/lib/axios";
import { CompanyFormComponentProps } from "@/types/company-form-schema";
import { Certifications } from "@/types/entities/enums/index.enum";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import FormFieldWrapper from "../../common/FormFieldWrapper";
import MultiSelectWrapper from "../../common/MultiSelectWrapper";

// Add type for business scope
interface BusinessScope {
  id: number;
  name: string;
  description?: string;
}

const LegalInformation: React.FC<CompanyFormComponentProps> = ({ form }) => {
  const t = useTranslations("companyRegistration");

  const { data: businessScopes, isLoading: businessScopesLoading } = useQuery<
    BusinessScope[]
  >({
    queryKey: ["business-scopes"],
    queryFn: () =>
      apiClient.get("/companies/business-scope").then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <MultiSelectWrapper
        form={form}
        name="legal.businessActivities"
        label={t("legal.businessActivities")}
        options={
          businessScopes?.map((scope) => ({
            value: scope.id.toString(),
            label: scope.name,
          })) ?? []
        }
        required
        isLoading={businessScopesLoading}
      />
      <FormFieldWrapper
        form={form}
        name="legal.industryCode"
        label={t("legal.industryCode")}
        placeholder={t("legal.industryCodePlaceholder")}
      />
      <MultiSelectWrapper
        form={form}
        name="legal.certifications"
        label={t("legal.certifications")}
        options={Object.values(Certifications).map((certification) => ({
          value: certification,
          label: certification,
        }))}
        required
      />
      <FormFieldWrapper
        form={form}
        name="legal.otherCertifications"
        label={t("legal.otherCertifications")}
        placeholder={t("legal.otherCertificationsPlaceholder")}
      />
    </div>
  );
};

export default LegalInformation;
