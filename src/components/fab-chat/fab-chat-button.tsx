"use client";

import { fabChatOpenAtom, fabChatPanelOpenAtom } from "@/store/atom-store";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { Sparkles, X } from "lucide-react";

export function FabChatButton() {
  const [isOpen, setIsOpen] = useAtom(fabChatOpenAtom);
  const [isPanelOpen] = useAtom(fabChatPanelOpenAtom);

  const toggleChat = () => {
    // Mobile haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mobile: Header when open, Chat bubble when closed */}
      {isOpen ? (
        <button
          type="button"
          onClick={toggleChat}
          className="md:hidden group fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 p-4 border-b border-primary-200/30 dark:border-primary-800/50 animate-in slide-in-from-top duration-300"
          style={{
            background: `
              radial-gradient(at 0% 0%, rgba(219, 103, 38, 0.95) 0px, transparent 50%),
              radial-gradient(at 100% 100%, rgba(234, 88, 12, 0.85) 0px, transparent 50%),
              linear-gradient(135deg, rgba(219, 103, 38, 1), rgba(249, 115, 22, 0.95))
            `,
          }}
          aria-label="Close Chancedee Mentor AI Assistant"
        >
          <div className="flex items-center gap-3">
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center"
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
                className="w-6 h-6 stroke-white"
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
            <h1 className="font-kanit text-base sm:text-lg text-white">
              Chancedee Mentor - AI
            </h1>
          </div>
          <div className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </div>
        </button>
      ) : (
        <motion.button
          onClick={toggleChat}
          className="md:hidden group fixed bottom-6 right-6 z-[60] rounded-full transition-all duration-300"
          style={{
            borderRadius: "50%",
            boxShadow: `
              0 4px 6px -1px rgba(219, 103, 38, 0.1),
              0 10px 15px -3px rgba(219, 103, 38, 0.15),
              0 20px 25px -5px rgba(219, 103, 38, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset
            `,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open Chancedee Mentor AI Assistant"
        >
          <div
            className="relative h-14 w-14 rounded-full flex items-center justify-center ring-2 ring-primary-500 dark:ring-primary-600"
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
              className="w-8 h-8 stroke-white"
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
          {/* AI Badge - Moved outside overflow container to prevent clipping */}
          <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-1 rounded-full shadow-lg z-10">
            <Sparkles className="w-3 h-3" />
          </div>
        </motion.button>
      )}

      {/* Desktop: Chat bubble (always visible) */}
      <div className="hidden md:block fixed bottom-8 right-8 lg:bottom-10 lg:right-10 z-[60]">
        {/* Tooltip - always visible when panel is closed */}
        {!isPanelOpen && (
          <motion.div
            className="absolute bottom-4 right-[calc(100%+12px)] px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm rounded-full backdrop-blur-sm whitespace-nowrap pointer-events-none border border-primary-500 dark:border-primary-600"
            style={{
              boxShadow: `
                0 4px 6px -1px rgba(219, 103, 38, 0.1),
                0 10px 15px -3px rgba(219, 103, 38, 0.15),
                0 20px 25px -5px rgba(219, 103, 38, 0.1)
              `,
            }}
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-4 h-4 stroke-primary-500 dark:stroke-primary-600"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="font-kanit font-medium">คุยกับ AI ที่ปรึกษา</span>
            </div>
          </motion.div>
        )}

        <motion.button
          onClick={toggleChat}
          className="group relative"
          style={{
            borderRadius: "50%",
            boxShadow: `
              0 4px 6px -1px rgba(219, 103, 38, 0.1),
              0 10px 15px -3px rgba(219, 103, 38, 0.15),
              0 20px 25px -5px rgba(219, 103, 38, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset
            `,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={
            isPanelOpen
              ? "Close Chancedee Mentor AI Assistant"
              : "Open Chancedee Mentor AI Assistant"
          }
        >
          <div
            className="relative h-16 w-16 rounded-full flex items-center justify-center ring-2 ring-primary-500 dark:ring-primary-600"
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
              className="w-9 h-9 stroke-white"
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
          {/* AI Badge - Moved outside overflow container to prevent clipping */}
          <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-1 rounded-full shadow-lg z-10">
            <Sparkles className="w-3 h-3" />
          </div>
        </motion.button>
      </div>
    </>
  );
}
