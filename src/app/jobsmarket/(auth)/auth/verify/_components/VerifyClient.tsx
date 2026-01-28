/**
 * Verify Client Component
 * Per RIS AUTH-R03 Section 7 (State Machine)
 *
 * Manages OTP verification flow for email changes
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OTPVerifyForm } from "@/components/jobsmarket/auth/OTPVerifyForm";
import { OTPResendButton } from "@/components/jobsmarket/auth/OTPResendButton";
import { sendVerificationOTPEmail } from "@/domains/authentication/services/server/actions/jobsmarket/otp-actions";
import { verifyOTPCode } from "@/domains/authentication/services/server/actions/jobsmarket/otp-actions";
import {
  updateAccountEmail,
  updateCandidateContactEmail,
  updateCompanyContactEmail,
} from "@/domains/authentication/services/server/actions/jobsmarket/email-update-actions";
import { SuccessScreen } from "./SuccessScreen";

/**
 * Page state per RIS Section 7.1.1
 */
type PageState =
  | "CHECKING_AUTH"
  | "SENDING_OTP"
  | "ENTER_OTP"
  | "VERIFYING"
  | "UPDATING"
  | "SUCCESS"
  | "ERROR";

interface VerifyClientProps {
  purpose: "account" | "candidate-contact" | "company-contact";
  email: string;
  entityId?: string;
  redirect: string;
}

/**
 * Purpose display texts (Thai)
 */
const PURPOSE_CONTEXT: Record<string, string> = {
  account: "เปลี่ยนอีเมลสำหรับเข้าสู่ระบบเป็น:",
  "candidate-contact": "ยืนยันอีเมลติดต่อในเรซูเม่:",
  "company-contact": "ยืนยันอีเมลติดต่อบริษัท:",
};

export function VerifyClient({
  purpose,
  email,
  entityId,
  redirect,
}: VerifyClientProps) {
  // State machine
  const [pageState, setPageState] = useState<PageState>("SENDING_OTP");
  const [error, setError] = useState<string>("");
  const [refCode, setRefCode] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);

  /**
   * Send initial OTP
   */
  const sendInitialOTP = async () => {
    setPageState("SENDING_OTP");
    setError("");

    try {
      const result = await sendVerificationOTPEmail({ email });

      if (!result.success || !result.refCode) {
        setError(result.error || "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง");
        setPageState("ERROR");
        return;
      }

      setRefCode(result.refCode);
      setCountdown(60); // 60 second cooldown
      setPageState("ENTER_OTP");
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("เกิดข้อผิดพลาดในการส่ง OTP");
      setPageState("ERROR");
    }
  };

  /**
   * Resend OTP
   */
  const handleResend = async () => {
    setError("");

    try {
      const result = await sendVerificationOTPEmail({ email });

      if (!result.success || !result.refCode) {
        setError(result.error || "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setRefCode(result.refCode);
      setCountdown(60);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("เกิดข้อผิดพลาดในการส่ง OTP");
    }
  };

  /**
   * Verify OTP code
   */
  const handleVerify = async (otpCode: string) => {
    setPageState("VERIFYING");
    setError("");

    try {
      const result = await verifyOTPCode({ refCode, otpCode });

      if (!result.success) {
        setError(result.error || "รหัส OTP ไม่ถูกต้อง");
        setPageState("ENTER_OTP");
        return;
      }

      // OTP verified, now update email
      await updateEmail();
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("เกิดข้อผิดพลาดในการตรวจสอบ OTP");
      setPageState("ENTER_OTP");
    }
  };

  /**
   * Update email (purpose-specific)
   */
  const updateEmail = async () => {
    setPageState("UPDATING");
    setError("");

    try {
      let result: { success: boolean; error?: string };

      switch (purpose) {
        case "account":
          result = await updateAccountEmail(email);
          break;

        case "candidate-contact":
          result = await updateCandidateContactEmail(email);
          break;

        case "company-contact":
          if (!entityId) {
            setError("ไม่พบข้อมูลบริษัท");
            setPageState("ERROR");
            return;
          }
          result = await updateCompanyContactEmail(entityId, email);
          break;

        default:
          setError("วัตถุประสงค์ไม่ถูกต้อง");
          setPageState("ERROR");
          return;
      }

      if (!result.success) {
        setError(result.error || "ไม่สามารถอัพเดทอีเมลได้");
        setPageState("ERROR");
        return;
      }

      // Success!
      setPageState("SUCCESS");
    } catch (err) {
      console.error("Update email error:", err);
      setError("เกิดข้อผิดพลาดในการอัพเดทอีเมล");
      setPageState("ERROR");
    }
  };

  // ========================================
  // Effects
  // ========================================

  // Send OTP on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    sendInitialOTP();
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  // ========================================
  // Render States
  // ========================================

  // SUCCESS state
  if (pageState === "SUCCESS") {
    return <SuccessScreen email={email} redirect={redirect} />;
  }

  // Main flow states
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">ยืนยันอีเมล</h1>
            <div className="text-sm text-gray-600">
              <p>{PURPOSE_CONTEXT[purpose]}</p>
              <p className="font-semibold text-gray-900 mt-1">{email}</p>
            </div>
          </div>

          {/* Loading state */}
          {pageState === "SENDING_OTP" && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p className="mt-4 text-gray-600">กำลังส่ง OTP...</p>
            </div>
          )}

          {/* OTP Entry */}
          {(pageState === "ENTER_OTP" || pageState === "VERIFYING") && (
            <div className="space-y-4">
              <OTPVerifyForm
                email={email}
                refCode={refCode}
                isLoading={pageState === "VERIFYING"}
                error={error}
                onVerify={handleVerify}
              />

              <OTPResendButton
                countdown={countdown}
                isLoading={false}
                onResend={handleResend}
              />
            </div>
          )}

          {/* Updating state */}
          {pageState === "UPDATING" && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p className="mt-4 text-gray-600">กำลังอัพเดทอีเมล...</p>
            </div>
          )}

          {/* Error state */}
          {pageState === "ERROR" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-red-900">
                      เกิดข้อผิดพลาด
                    </h3>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setError("");
                  sendInitialOTP();
                }}
                className="w-full"
              >
                ลองอีกครั้ง
              </Button>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="text-center">
          <a
            href={redirect}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ยกเลิกและกลับหน้าเดิม
          </a>
        </div>
      </div>
    </div>
  );
}
