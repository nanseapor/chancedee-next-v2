"use client";

import { motion } from "framer-motion";
import type { TextMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { UserAvatar } from "./shared/user-avatar";

interface TextMessageProps {
  message: TextMessage;
  isAnimated?: boolean;
}

export function TextMessageComponent({
  message,
  isAnimated = true,
}: TextMessageProps) {
  const isBot = message.sender === "bot";

  const MessageWrapper = isAnimated ? motion.div : "div";
  const animationProps = isAnimated
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  if (isBot) {
    return (
      <MessageWrapper
        className="flex gap-2 items-start"
        {...animationProps}
      >
        <BotAvatar />
        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%] border border-gray-100 dark:border-gray-600">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </MessageWrapper>
    );
  }

  return (
    <MessageWrapper
      className="flex justify-end"
      {...animationProps}
    >
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl rounded-br-sm px-4 py-3 shadow-sm max-w-[85%]">
        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </MessageWrapper>
  );
}
