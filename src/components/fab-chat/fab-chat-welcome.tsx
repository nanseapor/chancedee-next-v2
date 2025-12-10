"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function FabChatWelcome() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/sign-in");
  };

  const handleRegister = () => {
    router.push("/auth/sign-up");
  };

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 flex flex-col p-4 md:p-6 z-10 overflow-y-auto">
      <div className="flex-1 flex flex-col justify-end space-y-3 pb-4">
        {/* AI Greeting Bubble */}
        <motion.div
          className="flex gap-2 items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.9) 0px, transparent 50%),
                linear-gradient(135deg, rgba(219, 103, 38, 1), rgba(249, 115, 22, 0.95))
              `,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-white"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
              สวัสดีครับ! ยินดีต้อนรับสู่{" "}
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                ChanceDee 👋
              </span>
            </p>
          </div>
        </motion.div>

        {/* AI Features Bubble */}
        <motion.div
          className="flex gap-2 items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.9) 0px, transparent 50%),
                linear-gradient(135deg, rgba(219, 103, 38, 1), rgba(249, 115, 22, 0.95))
              `,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-white"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%]">
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 font-medium">
              ผมคือ{" "}
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                Career Advisor AI
              </span>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              พร้อมช่วยคุณในเรื่อง:
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>วางแผนเส้นทางอาชีพ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>สร้าง Resume มืออาชีพ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>เตรียมตัวสัมภาษณ์</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>พัฒนาทักษะที่ตลาดต้องการ</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Login Prompt Bubble */}
        <motion.div
          className="flex gap-2 items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center"
            style={{
              background: `
                radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.9) 0px, transparent 50%),
                linear-gradient(135deg, rgba(219, 103, 38, 1), rgba(249, 115, 22, 0.95))
              `,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 stroke-white"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm max-w-[85%]">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              🔐{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                เข้าสู่ระบบเพื่อเริ่มใช้งาน
              </span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              เข้าสู่ระบบเพื่อรับคำแนะนำและบันทึกความคืบหน้าของคุณ
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2.5 rounded-lg font-kanit text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                เข้าสู่ระบบ
              </Button>
              <Button
                onClick={handleRegister}
                variant="outline"
                className="w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 py-2.5 rounded-lg font-kanit text-sm font-semibold transition-all duration-300"
              >
                สมัครสมาชิก
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Message Input Placeholder (disabled) */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            disabled
            placeholder="พิมพ์ข้อความของคุณ..."
            className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
          />
          <button
            disabled
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-300 dark:bg-gray-600 text-white cursor-not-allowed"
            aria-label="ส่งข้อความ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
