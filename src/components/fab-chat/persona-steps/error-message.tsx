"use client";

import { motion } from "framer-motion";
import { AIAvatar } from "./shared/ai-avatar";

type ErrorMessageProps = {
  error: string;
};

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <motion.div
      className="flex gap-2 items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AIAvatar />
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
        <p className="text-sm text-red-700 dark:text-red-400">⚠️ {error}</p>
      </div>
    </motion.div>
  );
}
