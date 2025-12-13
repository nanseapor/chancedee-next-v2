/**
 * OTP Verification Hook
 * Per AUTH-R02 Implementation Plan Section 3.3
 * Per BLS-01 §3.3 - 60 second resend cooldown
 *
 * Handles OTP send/verify/resend logic with countdown timer
 */

"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { otpStateAtom, registerErrorAtom } from "@/store/jobsmarket/register-atoms";
import {
  sendVerificationOTPEmail,
  verifyOTPCode,
} from "@/domains/authentication/services/server/actions/jobsmarket/otp-actions";

export function useOTPVerification() {
  const [otpState, setOtpState] = useAtom(otpStateAtom);
  const [, setError] = useAtom(registerErrorAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend cooldown (60 seconds per BLS-01 §3.3)
  useEffect(() => {
    if (otpState.cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setOtpState((prev) => ({
          ...prev,
          cooldownSeconds: prev.cooldownSeconds - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      return undefined;
    }
  }, [otpState.cooldownSeconds, setOtpState]);

  /**
   * Send OTP to email
   * Rate limited: 5 requests / 15 minutes (AUTH-R00 implementation)
   */
  async function sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendVerificationOTPEmail({ email });

      if (result.success && result.refCode) {
        setOtpState({
          refCode: result.refCode,
          cooldownSeconds: 60, // 60 seconds per BLS-01 §3.3
          attemptCount: 0,
          verified: false,
        });
        setCanResend(false);
        return { success: true };
      } else {
        const errorMessage = result.error || "ไม่สามารถส่งรหัส OTP ได้";
        setError({ code: "OTP_SEND_FAILED", message: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      setError({ code: "UNKNOWN_ERROR", message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Verify OTP code
   * Rate limited: 5 attempts / 10 minutes per refCode (AUTH-R00 implementation)
   */
  async function verifyOTP(otpCode: string): Promise<{ success: boolean; error?: string }> {
    if (!otpState.refCode) {
      const errorMessage = "ไม่พบรหัสอ้างอิง กรุณาขอรหัส OTP ใหม่";
      setError({ code: "MISSING_REF_CODE", message: errorMessage });
      return { success: false, error: errorMessage };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOTPCode({
        refCode: otpState.refCode,
        otpCode,
      });

      if (result.success) {
        setOtpState((prev) => ({
          ...prev,
          verified: true,
        }));
        return { success: true };
      } else {
        const errorMessage = result.error || "รหัส OTP ไม่ถูกต้อง";
        setError({
          code: "INVALID_OTP",
          message: errorMessage,
          field: "otpCode",
        });
        setOtpState((prev) => ({
          ...prev,
          attemptCount: prev.attemptCount + 1,
        }));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      setError({ code: "UNKNOWN_ERROR", message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Resend OTP
   * Only allowed after 60-second cooldown
   */
  async function resendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    if (!canResend || otpState.cooldownSeconds > 0) {
      return {
        success: false,
        error: `กรุณารออีก ${otpState.cooldownSeconds} วินาที`,
      };
    }

    return sendOTP(email);
  }

  /**
   * Reset OTP state (for cleanup)
   */
  function resetOTP() {
    setOtpState({
      refCode: "",
      cooldownSeconds: 0,
      attemptCount: 0,
      verified: false,
    });
    setCanResend(false);
  }

  return {
    sendOTP,
    verifyOTP,
    resendOTP,
    resetOTP,
    isLoading,
    canResend,
    countdown: otpState.cooldownSeconds,
    attemptCount: otpState.attemptCount,
    verified: otpState.verified,
    refCode: otpState.refCode,
  };
}
