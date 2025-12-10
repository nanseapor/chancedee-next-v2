"use client";

import { motion } from "framer-motion";
import { AIAvatar } from "./shared/ai-avatar";

export function WelcomeMessage() {
  return (
    <motion.div
      className="flex gap-2 items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <AIAvatar />
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
          เพื่อให้ผมสามารถช่วยคุณได้ดีที่สุด กรุณาให้ข้อมูลเพิ่มเติมเล็กน้อย 🎯
        </p>
      </div>
    </motion.div>
  );
}
