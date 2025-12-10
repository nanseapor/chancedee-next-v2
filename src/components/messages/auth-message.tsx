"use client";

import { motion } from "framer-motion";
import type { AuthMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface AuthMessageProps {
  message: AuthMessage;
  isAnimated?: boolean;
}

export function AuthMessageComponent({
  message,
  isAnimated = true,
}: AuthMessageProps) {
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
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm p-5 shadow-md border border-gray-100 dark:border-gray-600 max-w-[85%]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🔐</span>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {message.title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {message.description}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={message.onLogin}
            className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <LogIn className="w-4 h-4 mr-1.5" />
            เข้าสู่ระบบ
          </Button>
          <Button
            onClick={message.onRegister}
            variant="outline"
            className="flex-1 border-2 border-secondary-500 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-500 hover:text-white transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            สมัครสมาชิก
          </Button>
        </div>
      </div>
    </MessageWrapper>
  );
}
