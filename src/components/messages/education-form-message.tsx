"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { EducationFormMessage } from "@/types/ai-message.types";
import type { educationHistory } from "@/types/candidate.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EducationFormMessageProps {
  message: EducationFormMessage;
  isAnimated?: boolean;
}

export function EducationFormMessageComponent({
  message,
  isAnimated = true,
}: EducationFormMessageProps) {
  const [formData, setFormData] = useState<educationHistory>(
    message.data || {
      institution: "",
      major: "",
      minor: "",
      educationLevel: 0,
      educationLabel: "",
      startYear: 0,
      endYear: 0,
      gpax: "",
      highlights: "",
      note: "",
    },
  );

  const MessageWrapper = isAnimated ? motion.div : "div";
  const animationProps = isAnimated
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    message.onSubmit?.(formData);
  };

  return (
    <MessageWrapper className="flex gap-2 items-start" {...animationProps}>
      <BotAvatar />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm p-5 shadow-md border border-gray-100 dark:border-gray-600 max-w-[90%] w-full"
      >
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
            <span>🎓</span>
            {message.title}
          </h3>
          {message.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {message.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3.5">
          <div>
            <Label
              htmlFor="institution"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              สถาบันการศึกษา <span className="text-red-500">*</span>
            </Label>
            <Input
              id="institution"
              type="text"
              value={formData.institution}
              onChange={(e) =>
                setFormData({ ...formData, institution: e.target.value })
              }
              placeholder="จุฬาลงกรณ์มหาวิทยาลัย"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="educationLevel"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              วุฒิการศึกษา <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.educationLevel?.toString() || ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  educationLevel: Number.parseInt(value),
                  educationLabel:
                    message.educationLevelOptions?.find(
                      (opt) => opt.value === Number.parseInt(value),
                    )?.label || "",
                })
              }
            >
              <SelectTrigger className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600">
                <SelectValue placeholder="เลือกวุฒิการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                {message.educationLevelOptions?.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="major"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              สาขา <span className="text-red-500">*</span>
            </Label>
            <Input
              id="major"
              type="text"
              value={formData.major || ""}
              onChange={(e) =>
                setFormData({ ...formData, major: e.target.value })
              }
              placeholder="วิศวกรรมคอมพิวเตอร์"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="endYear"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              ปีที่จบ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endYear"
              type="number"
              value={formData.endYear || ""}
              onChange={(e) =>
                setFormData({ ...formData, endYear: Number.parseInt(e.target.value) })
              }
              placeholder="2020"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
              required
              min="1950"
              max="2100"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {message.onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={message.onSkip}
              className="flex-[0.3] border-2 dark:border-gray-600"
            >
              ข้าม
            </Button>
          )}
          <Button
            type="submit"
            className="flex-[0.7] bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            บันทึก
          </Button>
        </div>
      </form>
    </MessageWrapper>
  );
}
