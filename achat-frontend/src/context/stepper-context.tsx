import React, { createContext, useContext, useState, useCallback } from 'react';
import { CompanyFormData } from '@/types/company-form-schema';
import { 
  companyRegistrationSteps, 
  validateStep, 
  getStepProgress,
  RegistrationStep 
} from '@/config/company-registration-steps';

interface StepperContextType {
  currentStep: number;
  totalSteps: number;
  progress: number;
  canProceed: boolean;
  currentStepData: RegistrationStep;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  validateCurrentStep: (formData: Partial<CompanyFormData>) => boolean;
}

const StepperContext = createContext<StepperContextType | undefined>(undefined);

export function StepperProvider({ 
  children,
  initialFormData = {}
}: { 
  children: React.ReactNode;
  initialFormData?: Partial<CompanyFormData>;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData] = useState<Partial<CompanyFormData>>(initialFormData);

  const nextStep = useCallback(() => {
    if (currentStep < companyRegistrationSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < companyRegistrationSteps.length) {
      setCurrentStep(step);
    }
  }, []);

  const validateCurrentStep = useCallback((data: Partial<CompanyFormData>) => {
    return validateStep(companyRegistrationSteps[currentStep], data);
  }, [currentStep]);

  const value = {
    currentStep,
    totalSteps: companyRegistrationSteps.length,
    progress: getStepProgress(currentStep, formData),
    canProceed: validateCurrentStep(formData),
    currentStepData: companyRegistrationSteps[currentStep],
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep
  };

  return (
    <StepperContext.Provider value={value}>
      {children}
    </StepperContext.Provider>
  );
}

export const useStepper = () => {
  const context = useContext(StepperContext);
  if (context === undefined) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context;
}; 