import AdditionalDetails from "@/components/ui/ocp/form/company/steps/AdditionalDetails";
import BasicInformation from "@/components/ui/ocp/form/company/steps/BasicInformation";
import DocumentUpload from "@/components/ui/ocp/form/company/steps/DocumentUpload";
import LegalInformation from "@/components/ui/ocp/form/company/steps/LegalInformation";
import {
  CompanyFormComponentProps,
  CompanyFormData,
} from "@/types/company-form-schema";

export interface StepValidation {
  fields: readonly (readonly [keyof CompanyFormData, string])[];
  customValidation?: (data: Partial<CompanyFormData>) => boolean;
}

export type StepId = "basicInfo" | "legal" | "documents" | "additional";

export interface RegistrationStep {
  id: StepId;
  title: string;
  description: string;
  component: React.ComponentType<CompanyFormComponentProps>;
  validation: StepValidation;
  optional?: boolean;
}

export const companyRegistrationSteps: RegistrationStep[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter your company's basic details",
    component: BasicInformation,
    validation: {
      fields: [
        ["basicInfo", "legalName"],
        ["basicInfo", "commercialName"],
        ["basicInfo", "legalForm"],
        ["basicInfo", "ICE"],
        ["contact", "primaryContact"],
        ["contact", "email"],
        ["contact", "primaryPhone"],
        ["address", "registeredOffice"],
        ["address", "headquarters"],
        ["address", "branchLocations"],
      ] as const,
    },
  },
  {
    id: "legal",
    title: "Legal Information",
    description: "Enter legal and certification details",
    component: LegalInformation,
    validation: {
      fields: [
        ["legal", "businessActivities"],
        ["legal", "industryCode"],
        ["legal", "certifications"],
      ] as const,
    },
  },
  {
    id: "documents",
    title: "Document Upload",
    description: "Upload required company documents",
    component: DocumentUpload,
    validation: {
      fields: [
        ["documents", "companyStatutes"],
        ["documents", "termsOfUseAndAccess"],
        ["documents", "commercialRegistry"],
        ["documents", "financialStatements"],
        ["documents", "clientReferences"],
      ] as const,
    },
    optional: true,
  },
  {
    id: "additional",
    title: "Additional Details",
    description: "Any additional information",
    component: AdditionalDetails,
    validation: {
      fields: [["additional", "0"]] as const,
    },
    optional: true,
  },
];

// Helper functions for step validation
export const validateStep = (
  step: RegistrationStep,
  formData: Partial<CompanyFormData>
): boolean => {
  // Check required fields
  const fieldsValid = step.validation.fields.every((field) => {
    const value = getNestedValue(formData, field);
    return value !== undefined && value !== "";
  });

  // Run custom validation if exists
  if (step.validation.customValidation) {
    return fieldsValid && step.validation.customValidation(formData);
  }

  return fieldsValid;
};

// Helper to get nested object values
const getNestedValue = <T extends Partial<CompanyFormData>>(
  obj: T,
  path: readonly [keyof T, string]
): unknown => {
  const [first, second] = path;
  return obj?.[first]?.[second as keyof (typeof obj)[keyof T]];
};

// Get step progress
export const getStepProgress = (
  currentStep: number,
  formData: Partial<CompanyFormData>
): number => {
  const completedSteps = companyRegistrationSteps
    .slice(0, currentStep)
    .filter((step) => validateStep(step, formData)).length;

  return (completedSteps / companyRegistrationSteps.length) * 100;
};
