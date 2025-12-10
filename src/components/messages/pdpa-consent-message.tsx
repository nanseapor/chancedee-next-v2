"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { PDPAConsentMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";

interface PDPAConsentMessageProps {
  message: PDPAConsentMessage;
  isAnimated?: boolean;
}

export function PDPAConsentMessageComponent({
  message,
  isAnimated = true,
}: PDPAConsentMessageProps) {
  const [isAccepted, setIsAccepted] = useState(message.isAccepted || false);

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
    if (isAccepted) {
      message.onSubmit?.();
    }
  };

  return (
    <MessageWrapper className="flex gap-2 items-start" {...animationProps}>
      <BotAvatar />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm p-5 shadow-md border border-gray-100 dark:border-gray-600 max-w-[90%] w-full"
      >
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {message.title}
            </h3>
          </div>
          {message.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {message.subtitle}
            </p>
          )}
        </div>

        {/* PDPA Content */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 border-l-4 border-primary-500">
          <div
            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="mb-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={isAccepted}
              onCheckedChange={(checked) => {
                setIsAccepted(checked === true);
                message.onAccept?.(checked === true);
              }}
              className="mt-1 data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
              {message.consentText}
              {message.linkUrl && message.linkText && (
                <>
                  {" "}
                  <a
                    href={message.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 underline hover:text-primary-600 transition-colors"
                  >
                    {message.linkText}
                  </a>
                </>
              )}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isAccepted}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ยอมรับและดำเนินการต่อ
        </Button>
      </form>
    </MessageWrapper>
  );
}
