import {
  companyRegistrationSteps,
  StepId,
} from "@/config/company-registration-steps";
import { useStepper } from "@/context/stepper-context";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

const Stepper: React.FC = () => {
  const { currentStep } = useStepper();
  const t = useTranslations("companyRegistration");

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-5 left-0 h-[2px] bg-gray-200 w-full -z-10" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-custom-green-500 transition-all duration-300 -z-10"
          style={{
            width: `${
              (currentStep / (companyRegistrationSteps.length - 1)) * 100
            }%`,
          }}
        />

        {companyRegistrationSteps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                index === currentStep
                  ? "bg-custom-green-500 text-white"
                  : index < currentStep
                  ? "bg-green-100 text-custom-green-500 border-2 border-custom-green-500"
                  : "bg-white border-2 border-gray-200 text-gray-500"
              }`}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="text-xs mt-2 text-center max-w-[100px] text-gray-600 font-medium">
              {t(`steps.${step.id as StepId}.title`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
