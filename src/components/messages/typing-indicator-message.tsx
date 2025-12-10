"use client";

import { motion } from "framer-motion";
import type { TypingIndicatorMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { TypingDots } from "./shared/typing-dots";

interface TypingIndicatorMessageProps {
  message: TypingIndicatorMessage;
  isAnimated?: boolean;
}

export function TypingIndicatorMessageComponent({
  message,
  isAnimated = true,
}: TypingIndicatorMessageProps) {
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
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-600">
        <TypingDots />
      </div>
    </MessageWrapper>
  );
}
