"use client";

import { Button } from "@/components/ui/button";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { Input } from "@/components/ui/input";
import { type educationHistory } from "@/types/candidate.types";
import { motion } from "framer-motion";
import { AIAvatar } from "./shared/ai-avatar";

type StepEducationProps = {
  education: educationHistory;
  onEducationChange: (education: educationHistory) => void;
  educationOptions: CustomSelectOption[];
  onNext: () => void;
  currentStep: number;
};

export function StepEducation({
  education,
  onEducationChange,
  educationOptions,
  onNext,
  currentStep,
}: StepEducationProps) {
  return (
    <motion.div
      className="flex gap-2 items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <AIAvatar />
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm max-w-[85%] w-fit">
        <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mb-3">
          4️⃣ ระดับการศึกษาสูงสุด
        </p>
        <CustomSelect
          value={
            education.educationLevel && education.educationLevel > 0
              ? education.educationLevel.toString()
              : ""
          }
          onChange={(val) => {
            if (currentStep > 3) return;
            const selectedEducation = educationOptions?.find(
              (option) => option.value === val,
            );
            if (selectedEducation) {
              onEducationChange({
                ...education,
                educationLabel: selectedEducation.label,
                educationLevel: parseInt(selectedEducation.value),
              });
            }
          }}
          options={educationOptions || []}
          placeholder="-- เลือกระดับการศึกษา --"
          className="h-9 w-full border-gray-300 text-slate-500"
        />
        <Input
          type="text"
          placeholder="สาขาวิชา *"
          className="mt-3"
          value={education.major || ""}
          onChange={(e) =>
            onEducationChange({
              ...education,
              major: e.target.value,
            })
          }
          disabled={currentStep > 3}
        />
        <Input
          type="text"
          placeholder="สถาบันการศึกษา *"
          className="mt-3"
          value={education.institution || ""}
          onChange={(e) =>
            onEducationChange({
              ...education,
              institution: e.target.value,
            })
          }
          disabled={currentStep > 3}
        />
        <Button
          onClick={onNext}
          disabled={
            !education.educationLevel ||
            !education.major ||
            !education.institution ||
            currentStep !== 3
          }
          className="w-full mt-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2 rounded-lg font-kanit text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ถัดไป
        </Button>
      </div>
    </motion.div>
  );
}
