"use client";

import {
  checkUserPersona,
} from "@/domains/fab-chat/services/server/actions/persona";
import {
  fabChatOpenAtom,
  fabChatPanelOpenAtom,
  userAtom,
} from "@/store/atom-store";
import { PersonaCheckResult } from "@/types/persona.types";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ChatSkeleton } from "./chat-skeleton";
import { FabChatPersonaStepper } from "./fab-chat-persona-stepper";
import { FabChatWelcome } from "./fab-chat-welcome";

const LoadingSpinner = () => (
  <div className="relative mb-8">
    <div className="w-20 h-20 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin shadow-lg" />
    <div
      className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-r-primary-400 animate-spin opacity-60"
      style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
    />
    <div className="absolute inset-2 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/10 to-primary-600/20 blur-sm" />
  </div>
);

export function FabChatPanel() {
  const [isOpen, setIsOpen] = useAtom(fabChatOpenAtom);
  const [isPanelOpen, setIsPanelOpen] = useAtom(fabChatPanelOpenAtom);
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [personaCheck, setPersonaCheck] = useState<PersonaCheckResult | null>(
    null,
  );
  const [isCheckingPersona, setIsCheckingPersona] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const toggleChat = () => setIsOpen((prev) => !prev);

  // Set mounted state after initial render to prevent flash
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, setIsOpen]);

  // Check persona when user is authenticated and panel opens
  useEffect(() => {
    if (isOpen && user) {
      setIsCheckingPersona(true);
      user.getIdToken().then((token) => {
        checkUserPersona(token).then((result) => {
          setPersonaCheck(result);
          setIsCheckingPersona(false);
        });
      });
    }
  }, [isOpen, user]);

  // Sync panel state with open state
  useEffect(() => {
    if (isOpen) {
      setIsPanelOpen(true);
    } else {
      setIsPanelOpen(false);
    }
  }, [isOpen, setIsPanelOpen]);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = undefined;
    }
  }, []);

  const showError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = undefined;
    }
  }, []);

  const retryLoad = useCallback(() => {
    setHasError(false);
    setIsLoading(true);

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }

    loadTimeoutRef.current = setTimeout(() => {
      showError();
    }, 30000);
  }, [showError]);

  useEffect(() => {
    if (!isOpen) return;

    loadTimeoutRef.current = setTimeout(() => {
      showError();
    }, 30000);

    const handleMessage = (event: MessageEvent) => {
      console.log("Message from iframe:", event.data);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen, showError]);

  // Don't render until mounted to prevent flash
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Mobile: Full-screen overlay (header is now in FabChatButton) */}
      <div
        className={`md:hidden fixed inset-0 top-[64px] z-40 bg-white dark:bg-gray-900 flex flex-col transition-transform duration-500 ease-in-out ${
          isOpen
            ? "translate-y-0 pointer-events-auto"
            : "translate-y-full pointer-events-none invisible"
        }`}
      >
        <div className="relative flex-1 bg-gray-50 dark:bg-gray-800">
          {/* Show welcome screen if not logged in */}
          {!user && <FabChatWelcome />}

          {/* Show loading while checking persona */}
          {user && isCheckingPersona && (
            <div
              className="absolute inset-0 bg-gradient-to-br from-white/95 via-primary-50/90 to-primary-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-700 ease-out"
              role="status"
              aria-label="กำลังตรวจสอบข้อมูลผู้ใช้"
            >
              <LoadingSpinner />
              <div className="text-center max-w-lg px-6">
                <div className="font-bold text-2xl mb-4 text-primary-800 tracking-tight">
                  กำลังตรวจสอบข้อมูล
                </div>
                <div className="text-base text-primary-700 leading-relaxed mb-6 font-medium">
                  กรุณารอสักครู่
                </div>
              </div>
            </div>
          )}

          {/* Show persona stepper if logged in but persona incomplete */}
          {user &&
            personaCheck &&
            !personaCheck.isComplete &&
            !isCheckingPersona && (
              <FabChatPersonaStepper
                missingFields={personaCheck.missingFields}
                existingData={personaCheck.currentData}
                onComplete={() => {
                  // Re-check persona after completion to update state
                  setIsCheckingPersona(true);
                  user.getIdToken().then((token) => {
                    checkUserPersona(token).then((result) => {
                      console.log("📋 Persona check result:", result);
                      setPersonaCheck(result);
                      setIsCheckingPersona(false);
                      // If still not complete after save, something went wrong
                      if (!result.isComplete) {
                        console.error(
                          "❌ Persona still incomplete after save!",
                        );
                        console.error("Missing fields:", result.missingFields);
                        console.error("Current data:", result.currentData);
                      } else {
                        console.log(
                          "✅ Persona complete! Loading chat interface...",
                        );
                      }
                    });
                  });
                }}
              />
            )}

          {isLoading && user && personaCheck?.isComplete && (
            <div
              className="absolute inset-0 bg-white dark:bg-gray-800 z-10"
              role="status"
              aria-label="กำลังโหลด Career Advisor"
            >
              <div className="flex flex-col items-center justify-center pt-8 pb-4">
                <LoadingSpinner />
                <div className="text-center max-w-lg px-6">
                  <div className="font-bold text-lg mb-2 text-primary-800 dark:text-primary-200 tracking-tight">
                    กำลังโหลด Career Advisor
                  </div>
                  <div className="text-sm text-primary-600 dark:text-primary-400 opacity-80">
                    กรุณารอสักครู่...
                  </div>
                </div>
              </div>
              <ChatSkeleton />
            </div>
          )}

          {hasError && user && personaCheck?.isComplete && (
            <div
              className="absolute inset-0 flex items-center justify-center p-5"
              role="alert"
              aria-label="เกิดข้อผิดพลาดในการโหลด"
            >
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center max-w-lg shadow-lg">
                <div className="text-5xl mb-4">⚠️</div>
                <div className="font-bold text-xl mb-4 text-red-800">
                  ไม่สามารถโหลด Career Advisor ได้
                </div>
                <p className="mb-6 text-base text-red-600 leading-relaxed">
                  ระบบอาจใช้เวลาในการโหลดนานกว่าปกติ
                  <br />
                  กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือลองใหม่อีกครั้ง
                </p>
                <Button
                  onClick={retryLoad}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
                  aria-label="ลองโหลดใหม่อีกครั้ง"
                >
                  🔄 ลองใหม่
                </Button>
              </div>
            </div>
          )}

          {user && personaCheck?.isComplete && (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 bg-white"
              src="https://genai-app-careeradvisor20250908-1-1757350955007-1023714844724.us-central1.run.app/?key=trrvlh86iiguo5po"
              title="Chance Mentor Career Advisor"
              allow="microphone; camera"
              sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
              loading="lazy"
              onLoad={hideLoading}
              onError={showError}
            />
          )}
        </div>
      </div>

      {/* Desktop: Floating popover card - positioned above FAB button */}
      <motion.div
        className="hidden md:flex fixed bottom-28 right-8 lg:bottom-32 lg:right-10 z-[60] flex-col w-[360px] md:w-[380px] lg:w-[400px] xl:w-[420px] max-w-[calc(100vw-8rem)] bg-white dark:bg-gray-900 shadow-2xl dark:shadow-primary-900/50 overflow-hidden rounded-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{
          opacity: isPanelOpen ? 1 : 0,
          scale: isPanelOpen ? 1 : 0.95,
          y: isPanelOpen ? 0 : 20,
        }}
        style={{
          pointerEvents: isPanelOpen ? "auto" : "none",
          visibility: isPanelOpen ? "visible" : "hidden",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
      >
        {/* Header with close button */}
        <div
          className="flex items-center gap-3 justify-between text-white px-4 py-3 rounded-t-2xl"
          style={{
            background: `
              radial-gradient(at 0% 0%, rgba(249, 115, 22, 0.95) 0px, transparent 50%),
              radial-gradient(at 100% 100%, rgba(219, 103, 38, 0.85) 0px, transparent 50%),
              linear-gradient(315deg, rgba(219, 103, 38, 1), rgba(249, 115, 22, 0.95))
            `,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center ring-2 ring-white/30"
              style={{
                background: "white",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-primary-600"
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
            <div>
              <span className="font-kanit text-base font-medium whitespace-nowrap block">
                Career Advisor AI
              </span>
              <div className="flex items-center gap-1 text-xs text-white/90">
                <motion.span
                  className="inline-block w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                <span>พร้อมให้คำปรึกษา</span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close Chancedee Mentor AI Assistant"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Panel content */}
        <div className="relative w-full h-[480px] md:h-[520px] lg:h-[560px] xl:h-[600px] max-h-[calc(100vh-10rem)] bg-gray-50 dark:bg-gray-800">
          {/* Show welcome screen if not logged in */}
          {!user && <FabChatWelcome />}

          {/* Show loading while checking persona */}
          {user && isCheckingPersona && (
            <div
              className="absolute inset-0 bg-gradient-to-br from-white/95 via-primary-50/90 to-primary-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-700 ease-out"
              role="status"
              aria-label="กำลังตรวจสอบข้อมูลผู้ใช้"
            >
              <LoadingSpinner />
              <div className="text-center max-w-lg px-6">
                <div className="font-bold text-2xl mb-4 text-primary-800 tracking-tight">
                  กำลังตรวจสอบข้อมูล
                </div>
                <div className="text-base text-primary-700 leading-relaxed mb-6 font-medium">
                  กรุณารอสักครู่
                </div>
              </div>
            </div>
          )}

          {/* Show persona stepper if logged in but persona incomplete */}
          {user &&
            personaCheck &&
            !personaCheck.isComplete &&
            !isCheckingPersona && (
              <FabChatPersonaStepper
                missingFields={personaCheck.missingFields}
                existingData={personaCheck.currentData}
                onComplete={() => {
                  // Re-check persona after completion to update state
                  setIsCheckingPersona(true);
                  user.getIdToken().then((token) => {
                    checkUserPersona(token).then((result) => {
                      console.log("📋 Persona check result:", result);
                      setPersonaCheck(result);
                      setIsCheckingPersona(false);
                      // If still not complete after save, something went wrong
                      if (!result.isComplete) {
                        console.error(
                          "❌ Persona still incomplete after save!",
                        );
                        console.error("Missing fields:", result.missingFields);
                        console.error("Current data:", result.currentData);
                      } else {
                        console.log(
                          "✅ Persona complete! Loading chat interface...",
                        );
                      }
                    });
                  });
                }}
              />
            )}

          {isLoading && user && personaCheck?.isComplete && (
            <div
              className="absolute inset-0 bg-white dark:bg-gray-800 z-10"
              role="status"
              aria-label="กำลังโหลด Career Advisor"
            >
              <div className="flex flex-col items-center justify-center pt-8 pb-4">
                <LoadingSpinner />
                <div className="text-center max-w-lg px-6">
                  <div className="font-bold text-lg mb-2 text-primary-800 dark:text-primary-200 tracking-tight">
                    กำลังโหลด Career Advisor
                  </div>
                  <div className="text-sm text-primary-600 dark:text-primary-400 opacity-80">
                    กรุณารอสักครู่...
                  </div>
                </div>
              </div>
              <ChatSkeleton />
            </div>
          )}

          {hasError && user && personaCheck?.isComplete && (
            <div
              className="absolute inset-0 flex items-center justify-center p-5"
              role="alert"
              aria-label="เกิดข้อผิดพลาดในการโหลด"
            >
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center shadow-lg">
                <div className="text-4xl mb-3">⚠️</div>
                <div className="font-bold text-lg mb-3 text-red-800">
                  ไม่สามารถโหลด Career Advisor ได้
                </div>
                <p className="mb-4 text-sm text-red-600 leading-relaxed">
                  ระบบอาจใช้เวลาในการโหลดนานกว่าปกติ
                  <br />
                  กรุณาลองใหม่อีกครั้ง
                </p>
                <Button
                  onClick={retryLoad}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105"
                  aria-label="ลองโหลดใหม่อีกครั้ง"
                >
                  🔄 ลองใหม่
                </Button>
              </div>
            </div>
          )}

          {user && personaCheck?.isComplete && (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0 bg-white"
              src="https://genai-app-careeradvisor20250908-1-1757350955007-1023714844724.us-central1.run.app/?key=trrvlh86iiguo5po"
              title="Chance Mentor Career Advisor"
              allow="microphone; camera"
              sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
              loading="lazy"
              onLoad={hideLoading}
              onError={showError}
            />
          )}
        </div>
      </motion.div>
    </>
  );
}
