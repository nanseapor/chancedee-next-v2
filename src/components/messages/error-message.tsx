"use client";

import { motion } from "framer-motion";
import type { ErrorMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorMessageProps {
  message: ErrorMessage;
  isAnimated?: boolean;
}

export function ErrorMessageComponent({
  message,
  isAnimated = true,
}: ErrorMessageProps) {
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
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-[85%]">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
            {message.title || "เกิดข้อผิดพลาด"}
          </h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
          {message.message}
        </p>
        {message.onRetry && (
          <Button
            onClick={message.onRetry}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            ลองอีกครั้ง
          </Button>
        )}
      </div>
    </MessageWrapper>
  );
}
