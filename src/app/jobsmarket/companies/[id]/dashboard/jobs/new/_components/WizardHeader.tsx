"use client";

import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/jobsmarket/jobs/indicators/SaveIndicator";
import type { WizardStep } from "@/types/jobsmarket/job-wizard.types";

const STEP_TITLES = {
  1: "ข้อมูลพื้นฐาน",
  2: "รายละเอียดงาน",
  3: "สถานที่ทำงาน",
  4: "ตรวจสอบและเผยแพร่",
} as const;

export interface WizardHeaderProps {
  currentStep: WizardStep;
  saveStatus: "idle" | "dirty" | "saving" | "saved" | "error";
  lastSaved?: Date;
  error?: string;
  onSaveClick?: () => void;
}

/**
 * Wizard header component
 * Displays progress, current step, and save status
 */
export function WizardHeader({
  currentStep,
  saveStatus,
  lastSaved,
  error,
  onSaveClick,
}: WizardHeaderProps) {
  const progress = (currentStep / 4) * 100;

  return (
    <div className="space-y-4">
      {/* Top row: Title + Save */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-gray-900">
            สร้างประกาศงาน
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            ขั้นตอนที่ {currentStep} จาก 4: {STEP_TITLES[currentStep]}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} error={error} />
          {onSaveClick && (
            <Button
              variant="outline"
              onClick={onSaveClick}
              disabled={saveStatus === "saving"}
            >
              บันทึกร่าง
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-secondary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="mt-2 flex justify-between">
          {([1, 2, 3, 4] as const).map((step) => (
            <div
              key={step}
              className={`flex items-center gap-2 ${
                step === currentStep
                  ? "font-medium text-secondary-700"
                  : step < currentStep
                    ? "text-secondary-600"
                    : "text-gray-400"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? "border-secondary-600 bg-secondary-600 text-white"
                    : step < currentStep
                      ? "border-secondary-600 bg-secondary-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step}
              </div>
              <span className="hidden text-sm md:inline">
                {STEP_TITLES[step]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
