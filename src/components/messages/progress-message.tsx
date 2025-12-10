"use client";

import { motion } from "framer-motion";
import type { ProgressMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressMessageProps {
  message: ProgressMessage;
  isAnimated?: boolean;
}

export function ProgressMessageComponent({
  message,
  isAnimated = true,
}: ProgressMessageProps) {
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
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {message.title}
        </h3>

        <div className="space-y-3">
          {message.steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center gap-3"
              initial={isAnimated ? { opacity: 0, x: -10 } : undefined}
              animate={isAnimated ? { opacity: 1, x: 0 } : undefined}
              transition={
                isAnimated ? { duration: 0.2, delay: index * 0.05 } : undefined
              }
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold transition-all duration-200",
                  step.status === "completed" &&
                    "bg-primary-500 text-white shadow-md",
                  step.status === "current" &&
                    "bg-primary-400 text-white shadow-md animate-pulse",
                  step.status === "pending" &&
                    "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400",
                )}
              >
                {step.status === "completed" ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div
                className={cn(
                  "text-sm transition-colors duration-200",
                  step.status === "completed" &&
                    "text-gray-700 dark:text-gray-300",
                  step.status === "current" &&
                    "text-gray-900 dark:text-gray-100 font-semibold",
                  step.status === "pending" &&
                    "text-gray-500 dark:text-gray-400",
                )}
              >
                {step.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MessageWrapper>
  );
}
