"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { HighestEducationInputMessage } from "@/types/ai-message.types";
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
import { GraduationCap } from "lucide-react";

interface HighestEducationInputMessageProps {
  message: HighestEducationInputMessage;
  isAnimated?: boolean;
}

export function HighestEducationInputMessageComponent({
  message,
  isAnimated = true,
}: HighestEducationInputMessageProps) {
  const [formData, setFormData] = useState(
    message.data || {
      educationLevel: "",
      major: "",
      institution: "",
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
    if (formData.educationLevel) {
      message.onSubmit?.({
        educationLevel: formData.educationLevel,
        major: formData.major,
        institution: formData.institution,
      });
    }
  };

  return (
    <MessageWrapper className="flex gap-2 items-start" {...animationProps}>
      <BotAvatar />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm p-5 shadow-md border border-gray-100 dark:border-gray-600 max-w-[90%] w-full"
      >
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {message.title}
            </h3>
          </div>
          {message.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {message.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3.5">
          <div>
            <Label
              htmlFor="educationLevel"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              ระดับการศึกษาสูงสุด <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.educationLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, educationLevel: value })
              }
            >
              <SelectTrigger className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600">
                <SelectValue placeholder="-- เลือกระดับการศึกษา --" />
              </SelectTrigger>
              <SelectContent>
                {message.educationLevelOptions?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                )) || (
                  <>
                    <SelectItem value="highschool">มัธยมศึกษา</SelectItem>
                    <SelectItem value="diploma">ปวช./ปวส.</SelectItem>
                    <SelectItem value="bachelor">ปริญญาตรี</SelectItem>
                    <SelectItem value="master">ปริญญาโท</SelectItem>
                    <SelectItem value="phd">ปริญญาเอก</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="major"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              สาขาวิชา
            </Label>
            <Input
              id="major"
              type="text"
              value={formData.major || ""}
              onChange={(e) =>
                setFormData({ ...formData, major: e.target.value })
              }
              placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          <div>
            <Label
              htmlFor="institution"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              สถาบันการศึกษา
            </Label>
            <Input
              id="institution"
              type="text"
              value={formData.institution || ""}
              onChange={(e) =>
                setFormData({ ...formData, institution: e.target.value })
              }
              placeholder="เช่น จุฬาลงกรณ์มหาวิทยาลัย"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!formData.educationLevel}
          className="w-full mt-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ถัดไป
        </Button>
      </form>
    </MessageWrapper>
  );
}
