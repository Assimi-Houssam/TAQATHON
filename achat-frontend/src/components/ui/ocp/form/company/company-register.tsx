import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { companyRegistrationSteps } from "@/config/company-registration-steps";
import { useStepper } from "@/context/stepper-context";
import { useCreateCompany } from "@/endpoints/company/create-company";
import {
  CompanyFormData,
  companyFormSchema,
} from "@/types/company-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Stepper from "../../form-stepper";

export default function CompanyRegistrationForm() {
  const { currentStep, nextStep, prevStep } = useStepper();
  const t = useTranslations("companyRegistration");
  const locale = useLocale();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    mode: "onChange",
  });

  console.log(locale);
  console.log(form.getValues());
  console.log(form.formState.errors);

  const createCompany = useCreateCompany();

  const handleNextStep = async () => {
    const currentStepConfig = companyRegistrationSteps[currentStep];

    try {
      const validationResults = await Promise.all(
        [
          ...new Map(
            currentStepConfig.validation.fields.map((item) => [item[0], item])
          ).values(),
        ].map(([fieldName]) => form.trigger(fieldName))
      );

      if (validationResults.includes(false)) {
        toast.error(t("validation.fillRequired"));
        return;
      }

      // Check custom validation if exists
      if (currentStepConfig.validation.customValidation) {
        const customValid = currentStepConfig.validation.customValidation(
          form.getValues()
        );
        if (!customValid) {
          toast.error(t("validation.ensureRequirements"));
          return;
        }
      }

      nextStep();
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(t("validation.error"));
    }
  };

  const handlePrevStep = () => {
    prevStep();
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await createCompany.mutateAsync(data);
      toast.success(t("submission.success"));
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(t("submission.error"));
    }
  };

  const CurrentStepComponent = companyRegistrationSteps[currentStep].component;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Stepper />
        <CurrentStepComponent form={form} />
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            {t("buttons.previous")}
          </Button>
          {currentStep === companyRegistrationSteps.length - 1 ? (
            <Button type="submit">{t("buttons.submit")}</Button>
          ) : (
            <Button type="button" onClick={handleNextStep}>
              {t("buttons.next")}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
