"use client";

import { FabChatPersonaStepper } from "@/components/fab-chat/fab-chat-persona-stepper";
import { FabChatWelcome } from "@/components/fab-chat/fab-chat-welcome";
import { Button } from "@/components/ui/button";
import {
  checkUserPersona,
} from "@/domains/fab-chat/services/server/actions/persona";
import { userAtom } from "@/store/atom-store";
import { PersonaCheckResult } from "@/types/persona.types";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

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

export default function AIAssistantPage() {
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [personaCheck, setPersonaCheck] = useState<PersonaCheckResult | null>(
    null,
  );
  const [isCheckingPersona, setIsCheckingPersona] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout>(undefined);

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

  // Check persona when user is authenticated
  useEffect(() => {
    if (user) {
      setIsCheckingPersona(true);
      user.getIdToken().then((token) => {
        checkUserPersona(token).then((result) => {
          setPersonaCheck(result);
          setIsCheckingPersona(false);
        });
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user || !personaCheck?.isComplete) {
      return;
    }

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
  }, [user, personaCheck?.isComplete, showError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100/30 to-primary-200/20 p-0 md:p-5">
      <div className="absolute inset-0 pointer-events-none">
        {/* Left side bubbles */}
        <div className="absolute left-[5%] bottom-4 w-10 h-10 bg-primary-400 rounded-full opacity-20 animate-rise-slower" />
        <div className="absolute left-[12%] bottom-4 w-16 h-16 bg-primary-500 rounded-full opacity-25 animate-rise-slow" />
        <div className="absolute left-[20%] bottom-4 w-12 h-12 bg-primary-600 rounded-full opacity-20 animate-rise max-sm:hidden" />
        <div className="absolute left-[8%] top-[30%] w-14 h-14 bg-primary-300 rounded-full opacity-15 animate-rise" />
        <div className="absolute left-[18%] top-[60%] w-8 h-8 bg-primary-500 rounded-full opacity-30 animate-rise-slow max-sm:hidden" />

        {/* Right side bubbles */}
        <div className="absolute right-[5%] bottom-4 w-20 h-20 bg-primary-500 rounded-full opacity-10 animate-rise" />
        <div className="absolute right-[12%] bottom-4 w-16 h-16 bg-primary-400 rounded-full opacity-30 animate-rise-slower" />
        <div className="absolute right-[20%] bottom-4 w-8 h-8 bg-primary-600 rounded-full opacity-25 animate-rise-slow" />
        <div className="absolute right-[8%] top-[30%] w-14 h-14 bg-primary-300 rounded-full opacity-15 animate-rise max-sm:hidden" />
        <div className="absolute right-[18%] top-[60%] w-12 h-12 bg-primary-500 rounded-full opacity-20 animate-rise-slower max-sm:hidden" />
      </div>
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-white via-primary-50/20 to-primary-100/10 backdrop-blur-sm md:rounded-3xl shadow-2xl border border-primary-200/20 overflow-hidden relative z-10">
        {/* Header Section */}
        <div
          className="flex items-center gap-3 text-white px-4 py-3 md:px-6"
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
            <h1 className="font-kanit text-xl text-white">Career Advisor AI</h1>
          </div>
        </div>

        {/* Chatbot Section */}
        <div className="relative w-full h-[600px] md:h-[700px] lg:h-[600px] bg-gray-50 rounded-t-xl md:rounded-none">
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

          {/* Loading Overlay */}
          {isLoading && user && personaCheck?.isComplete && (
            <div
              className="absolute inset-0 bg-gradient-to-br from-white/95 via-primary-50/90 to-primary-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-700 ease-out"
              role="status"
              aria-label="กำลังโหลด Career Advisor"
            >
              <LoadingSpinner />
              <div className="text-center max-w-lg px-6">
                <div className="font-bold text-2xl mb-4 text-primary-800 tracking-tight">
                  กำลังโหลด Career Advisor
                </div>
                <div className="text-base text-primary-700 leading-relaxed mb-6 font-medium">
                  กรุณารอสักครู่ ระบบกำลังเตรียมความพร้อม
                </div>
                <div className="text-sm text-primary-600 opacity-80">
                  โหลดใน 30 วินาที หรือน้อยกว่า
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
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

          {/* Iframe - only show when user is logged in and persona is complete */}
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

        {/* Footer Section */}
        <div className="bg-gradient-to-r from-primary-50 via-white to-primary-50 p-4 md:px-6 text-center border-t border-primary-200/30">
          <p className="mb-4 text-primary-800 text-lg font-medium">
            <span className="font-bold">Tips:</span> พิมพ์คำถามเกี่ยวกับอาชีพ
            หรือบอกสถานการณ์ที่ต้องการคำปรึกษา
          </p>
          <p className="text-primary-600 font-medium">
            Powered by{" "}
            <span className="font-bold text-primary-700">Chance Mentor AI</span>{" "}
            • Built for career excellence
          </p>
        </div>
      </div>
    </div>
  );
}
