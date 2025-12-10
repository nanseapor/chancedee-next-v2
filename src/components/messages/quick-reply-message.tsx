"use client";

import { motion } from "framer-motion";
import type { QuickReplyMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickReplyMessageProps {
  message: QuickReplyMessage;
  isAnimated?: boolean;
}

export function QuickReplyMessageComponent({
  message,
  isAnimated = true,
}: QuickReplyMessageProps) {
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
      <div className="flex-1 max-w-[85%]">
        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-600">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {message.options.map((option, index) => (
            <Button
              key={option.id}
              variant="outline"
              size="sm"
              onClick={() => message.onSelect?.(option.value)}
              className={cn(
                "h-auto py-2 px-4 rounded-full text-sm font-medium transition-all duration-200",
                "border-2 border-primary-500 text-primary-600 dark:text-primary-400",
                "hover:bg-primary-500 hover:text-white hover:shadow-md hover:-translate-y-0.5",
                "bg-white dark:bg-gray-800",
              )}
              style={{
                animationDelay: isAnimated ? `${index * 0.05}s` : "0s",
              }}
            >
              {option.icon && <span className="mr-1.5">{option.icon}</span>}
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </MessageWrapper>
  );
}
