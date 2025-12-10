"use client";

import { motion } from "framer-motion";
import type { ConfirmationMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit } from "lucide-react";

interface ConfirmationMessageProps {
  message: ConfirmationMessage;
  isAnimated?: boolean;
}

export function ConfirmationMessageComponent({
  message,
  isAnimated = true,
}: ConfirmationMessageProps) {
  const MessageWrapper = isAnimated ? motion.div : "div";
  const animationProps = isAnimated
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <MessageWrapper className="flex gap-2 items-start" {...animationProps}>
      <BotAvatar />
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm p-5 shadow-md border border-gray-100 dark:border-gray-600 max-w-[90%] w-full">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {message.title}
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-600">
          <div className="space-y-2 text-sm">
            {Object.entries(message.data).map(([key, value], index) => (
              <motion.div
                key={key}
                className="flex gap-2"
                initial={isAnimated ? { opacity: 0, x: -10 } : undefined}
                animate={isAnimated ? { opacity: 1, x: 0 } : undefined}
                transition={
                  isAnimated ? { duration: 0.2, delay: index * 0.05 } : undefined
                }
              >
                <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">
                  {key}:
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {String(value)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {message.onConfirm && (
            <Button
              onClick={message.onConfirm}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              ยืนยันข้อมูล
            </Button>
          )}
          {message.onEdit && (
            <Button
              onClick={message.onEdit}
              variant="outline"
              className="flex-1 border-2 border-secondary-500 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-500 hover:text-white transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              แก้ไข
            </Button>
          )}
        </div>
      </div>
    </MessageWrapper>
  );
}
