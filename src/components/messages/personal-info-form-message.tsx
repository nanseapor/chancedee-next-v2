"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type {
  PersonalInfoFormMessage,
  PersonalInfoFormData,
} from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoFormMessageProps {
  message: PersonalInfoFormMessage;
  isAnimated?: boolean;
}

export function PersonalInfoFormMessageComponent({
  message,
  isAnimated = true,
}: PersonalInfoFormMessageProps) {
  const [formData, setFormData] = useState<PersonalInfoFormData>(
    message.data || {},
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
            <span>📝</span>
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
              htmlFor="fullName"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName || ""}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="สมชาย ใจดี"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              อีเมล <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="somchai@example.com"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
            >
              เบอร์โทร
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="081-234-5678"
              className="border-2 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
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
            ถัดไป
          </Button>
        </div>
      </form>
    </MessageWrapper>
  );
}
