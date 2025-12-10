"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AIChatTermsAndConditions from "../../static/AIChatTermsAndConditions";
import { AIAvatar } from "./shared/ai-avatar";

type StepConsentProps = {
  isConsent: boolean;
  onConsentChange: (value: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  currentStep: number;
};

export function StepConsent({
  isConsent,
  onConsentChange,
  onSave,
  isSaving,
  currentStep,
}: StepConsentProps) {
  return (
    <motion.div
      className="flex gap-2 items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <AIAvatar />
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm max-w-[85%] w-fit">
        <p className="text-base text-gray-800 dark:text-gray-200 font-semibold mb-1">
          🔒 นโยบายความเป็นส่วนตัว (PDPA)
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-200 font-semibold mb-3">
          เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ
        </p>
        <div className="mb-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs text-secondary-900">
            ChanceDee จะเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของคุณเพื่อ:
          </p>
          <ul className="text-xs text-secondary-900">
            <li>ให้บริการที่ปรึกษาอาชีพและสร้าง Resume</li>
            <li>ปรับปรุงและพัฒนาบริการของเรา</li>
            <li>ติดต่อสื่อสารเกี่ยวกับบริการ</li>
          </ul>
        </div>
        <AIChatTermsAndConditions
          checked={isConsent}
          setChecked={onConsentChange}
        />
        <Button
          onClick={onSave}
          disabled={!isConsent || isSaving || currentStep !== 4}
          className="w-full mt-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2 rounded-lg font-kanit text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "กำลังบันทึก..." : "ยอมรับและดำเนินการต่อ"}
        </Button>
      </div>
    </motion.div>
  );
}
