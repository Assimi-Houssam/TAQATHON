import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFields } from "@/endpoints/forms/useFormFields";
import { useSubmitFormAnswers } from "@/endpoints/forms/useFormMutations";
import { CompanyFormComponentProps } from "@/types/company-form-schema";
import { useLocale, useTranslations } from "next-intl";
import { FormsAnswerTable } from "../../../FormAnswerTable";

const AdditionalDetails: React.FC<CompanyFormComponentProps> = ({ form }) => {
  const locale = useLocale();
  const { data: formFields, isLoading } = useFormFields(
    "register-company",
    locale
  );
  const submitAllAnswers = useSubmitFormAnswers();
  const t = useTranslations("companyRegistration");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">{t("additional.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              {t("additional.loading")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">{t("additional.title")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormsAnswerTable
            form={form}
            formFields={formFields ?? []}
            fieldPath="additional"
            isPending={submitAllAnswers.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdditionalDetails;
