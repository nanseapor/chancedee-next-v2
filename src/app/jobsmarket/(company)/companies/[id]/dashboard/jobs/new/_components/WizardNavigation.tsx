"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import type { WizardStep } from "@/types/jobsmarket/job-wizard.types";

export interface WizardNavigationProps {
  currentStep: WizardStep;
  canProceed: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  onPublish?: () => void;
}

/**
 * Wizard navigation component
 * Back/Next buttons with conditional publish button on final step
 */
export function WizardNavigation({
  currentStep,
  canProceed,
  isSubmitting = false,
  onBack,
  onNext,
  onPublish,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isFinalStep = currentStep === 4;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
      {/* Back button */}
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        ย้อนกลับ
      </Button>

      {/* Next or Publish button */}
      {isFinalStep ? (
        <Button
          onClick={onPublish}
          disabled={!canProceed || isSubmitting}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "กำลังดำเนินการ..." : "เผยแพร่"}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className="flex items-center gap-2"
          variant="secondary"
        >
          ถัดไป
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
