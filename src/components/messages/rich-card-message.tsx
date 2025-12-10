"use client";

import { motion } from "framer-motion";
import type { RichCardMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface RichCardMessageProps {
  message: RichCardMessage;
  isAnimated?: boolean;
}

export function RichCardMessageComponent({
  message,
  isAnimated = true,
}: RichCardMessageProps) {
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
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm overflow-hidden shadow-md border border-gray-100 dark:border-gray-600 max-w-[90%]">
        {/* Image or Emoji Header */}
        <div className="relative w-full h-36 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          {message.imageUrl ? (
            <Image
              src={message.imageUrl}
              alt={message.title}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-6xl">{message.imageEmoji || "📄"}</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {message.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            {message.description}
          </p>
          {message.onAction && (
            <Button
              onClick={message.onAction}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              {message.buttonLabel || "ดูเพิ่มเติม"}
            </Button>
          )}
        </div>
      </div>
    </MessageWrapper>
  );
}
