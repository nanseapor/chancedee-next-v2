"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AIAvatar } from "./shared/ai-avatar";

type StepCareerLevelProps = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  currentStep: number;
  isSaving: boolean;
};

const CAREER_OPTIONS = [
  { value: "newbie", label: "นักศึกษาจบใหม่" },
  { value: "junior", label: "ระดับเริ่มต้น (Junior)" },
  { value: "senior", label: "ระดับอาวุโส (Senior)" },
  { value: "manager", label: "ระดับผู้จัดการ (Manager)" },
];

export function StepCareerLevel({
  value,
  onChange,
  onNext,
  currentStep,
  isSaving,
}: StepCareerLevelProps) {
  return (
    <motion.div
      className="flex gap-2 items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <AIAvatar />
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm max-w-[85%] w-fit">
        <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mb-3">
          1️⃣ ระดับประสบการณ์การทำงานของคุณ
        </p>
        <div className="flex flex-col gap-2">
          {CAREER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={currentStep > 0 || isSaving}
              className={cn(
                "w-56 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                value === option.value
                  ? "bg-primary-500 text-white"
                  : currentStep > 0 || isSaving
                    ? "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900/30",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button
          onClick={onNext}
          disabled={!value || currentStep !== 0}
          className="w-full mt-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2 rounded-lg font-kanit text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ถัดไป
        </Button>
      </div>
    </motion.div>
  );
}
