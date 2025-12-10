"use client";

import { motion } from "framer-motion";
import type { ResumePreviewMessage } from "@/types/ai-message.types";
import { BotAvatar } from "./shared/bot-avatar";
import { Button } from "@/components/ui/button";
import { Download, Edit, FileText } from "lucide-react";

interface ResumePreviewMessageProps {
  message: ResumePreviewMessage;
  isAnimated?: boolean;
}

export function ResumePreviewMessageComponent({
  message,
  isAnimated = true,
}: ResumePreviewMessageProps) {
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {message.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {message.subtitle ||
                `สำเร็จแล้ว${message.pageCount ? ` • ${message.pageCount} หน้า` : ""}`}
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-full h-52 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-600">
          {message.previewUrl ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {/* Could be an iframe or image preview */}
              <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Resume Preview</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Resume Preview</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {message.onDownload && (
            <Button
              onClick={message.onDownload}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-1.5" />
              ดาวน์โหลด PDF
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
