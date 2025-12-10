"use client";

import { motion } from "framer-motion";
import type { ListMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { cn } from "@/lib/utils";

interface ListMessageProps {
  message: ListMessage;
  isAnimated?: boolean;
}

export function ListMessageComponent({
  message,
  isAnimated = true,
}: ListMessageProps) {
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
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm p-4 shadow-md border border-gray-100 dark:border-gray-600 max-w-[90%] w-full">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {message.title}
        </h3>

        <div className="space-y-2">
          {message.items.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => message.onSelect?.(item.value)}
              className={cn(
                "w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600",
                "flex items-center gap-3 text-left",
                "transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20",
                "hover:shadow-sm cursor-pointer",
              )}
              initial={isAnimated ? { opacity: 0, x: -10 } : undefined}
              animate={isAnimated ? { opacity: 1, x: 0 } : undefined}
              transition={
                isAnimated ? { duration: 0.2, delay: index * 0.05 } : undefined
              }
            >
              <div className="text-2xl flex-shrink-0">{item.icon || "📄"}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.subtitle}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </MessageWrapper>
  );
}
