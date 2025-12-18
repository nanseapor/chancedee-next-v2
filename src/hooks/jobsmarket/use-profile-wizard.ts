"use client";

import { useState, useCallback } from "react";

/**
 * Profile Creation Wizard State Hook
 *
 * Manages multi-step wizard state for CAND-R02 Profile Creation
 *
 * Features:
 * - Step navigation (next, back, goto)
 * - Draft data persistence (in memory)
 * - Step validation tracking
 * - Progress calculation
 */

export interface ProfileWizardStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isValid: boolean;
}

export interface UseProfileWizardOptions {
  /** Total number of steps */
  totalSteps?: number;
  /** Initial step (1-indexed) */
  initialStep?: number;
  /** Callback when step changes */
  onStepChange?: (step: number) => void;
  /** Callback when wizard completes */
  onComplete?: () => void;
}

export interface UseProfileWizardReturn {
  /** Current step (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Is first step */
  isFirstStep: boolean;
  /** Is last step */
  isLastStep: boolean;
  /** Can go to next step */
  canGoNext: boolean;
  /** Can go to previous step */
  canGoBack: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  previousStep: () => void;
  /** Go to specific step */
  goToStep: (step: number) => void;
  /** Mark current step as completed */
  completeStep: () => void;
  /** Set step validation state */
  setStepValid: (step: number, isValid: boolean) => void;
  /** Get step info */
  getStepInfo: (step: number) => ProfileWizardStep | undefined;
  /** Reset wizard */
  reset: () => void;
}

const WIZARD_STEPS: Omit<ProfileWizardStep, "isCompleted" | "isValid">[] = [
  {
    id: 1,
    title: "ข้อมูลส่วนตัว",
    description: "ชื่อ, เบอร์โทร, อีเมล, ที่อยู่",
  },
  {
    id: 2,
    title: "การศึกษา",
    description: "ระดับการศึกษาและสถาบัน",
  },
  {
    id: 3,
    title: "ประสบการณ์ทำงาน",
    description: "ประวัติการทำงานหรือนักศึกษาจบใหม่",
  },
  {
    id: 4,
    title: "ทักษะและภาษา",
    description: "ทักษะและความสามารถทางภาษา",
  },
  {
    id: 5,
    title: "ความต้องการงาน",
    description: "ตำแหน่งและเงินเดือนที่ต้องการ",
  },
];

export function useProfileWizard(
  options: UseProfileWizardOptions = {}
): UseProfileWizardReturn {
  const {
    totalSteps = 5,
    initialStep = 1,
    onStepChange,
    onComplete,
  } = options;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [validSteps, setValidSteps] = useState<Set<number>>(new Set());

  // Derived state
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const canGoNext = currentStep < totalSteps;
  const canGoBack = currentStep > 1;
  const progress = Math.round((completedSteps.size / totalSteps) * 100);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (canGoNext) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, canGoNext, onStepChange]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (canGoBack) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, canGoBack, onStepChange]);

  // Navigate to specific step
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [totalSteps, onStepChange]
  );

  // Mark current step as completed
  const completeStep = useCallback(() => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });

    // If last step, trigger completion
    if (isLastStep) {
      onComplete?.();
    }
  }, [currentStep, isLastStep, onComplete]);

  // Set step validation state
  const setStepValid = useCallback((step: number, isValid: boolean) => {
    setValidSteps((prev) => {
      const next = new Set(prev);
      if (isValid) {
        next.add(step);
      } else {
        next.delete(step);
      }
      return next;
    });
  }, []);

  // Get step info
  const getStepInfo = useCallback(
    (step: number): ProfileWizardStep | undefined => {
      const stepDef = WIZARD_STEPS.find((s) => s.id === step);
      if (!stepDef) return undefined;

      return {
        ...stepDef,
        isCompleted: completedSteps.has(step),
        isValid: validSteps.has(step),
      };
    },
    [completedSteps, validSteps]
  );

  // Reset wizard
  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
    setValidSteps(new Set());
  }, [initialStep]);

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoBack,
    progress,
    nextStep,
    previousStep,
    goToStep,
    completeStep,
    setStepValid,
    getStepInfo,
    reset,
  };
}
