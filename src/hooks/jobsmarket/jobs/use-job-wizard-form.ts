import { useState, useCallback } from "react";
import {
  validateStep1,
  validateStep2,
  validateStep3,
} from "@/lib/jobsmarket/company/job-form-validation";
import type {
  JobFormData,
  WizardStep,
  StepValidation,
} from "@/types/jobsmarket/job-wizard.types";
import { DEFAULT_JOB_FORM_DATA } from "@/types/jobsmarket/job-wizard.types";

/**
 * Job wizard form state management hook
 * Manages form data, step navigation, and validation
 *
 * @param initialData - Optional initial form data (for drafts or duplicates)
 */
export function useJobWizardForm(initialData?: Partial<JobFormData>) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<JobFormData>({
    ...DEFAULT_JOB_FORM_DATA,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Update a single form field
   */
  const updateField = useCallback(
    (fieldName: keyof JobFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      setIsDirty(true);

      // Clear field-specific error when field is updated
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    },
    []
  );

  /**
   * Validate a specific step
   */
  const validateStep = useCallback(
    (step: WizardStep): boolean => {
      let validation: StepValidation;

      switch (step) {
        case 1:
          validation = validateStep1(formData);
          break;
        case 2:
          validation = validateStep2(formData);
          break;
        case 3:
          validation = validateStep3(formData);
          break;
        case 4:
          // Step 4 is review, no validation needed
          validation = { isValid: true, errors: {} };
          break;
        default:
          validation = { isValid: false, errors: {} };
      }

      setErrors(validation.errors);
      return validation.isValid;
    },
    [formData]
  );

  /**
   * Move to next step if current step is valid
   */
  const goToNextStep = useCallback(() => {
    const isValid = validateStep(currentStep);

    if (isValid && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  }, [currentStep, validateStep]);

  /**
   * Move to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  }, [currentStep]);

  /**
   * Jump to specific step (from review step)
   */
  const jumpToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      ...DEFAULT_JOB_FORM_DATA,
      ...initialData,
    });
    setCurrentStep(1);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  return {
    // State
    currentStep,
    formData,
    errors,
    isDirty,

    // Actions
    updateField,
    validateStep,
    goToNextStep,
    goToPreviousStep,
    jumpToStep,
    setCurrentStep,
    resetForm,
  };
}
