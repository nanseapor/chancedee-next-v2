/**
 * OTP Resend Button Component
 * Per AUTH-R02 Implementation Plan Section 2 (Shared Components)
 * Per BLS-01 §3.3 - 60 second resend cooldown
 *
 * Shared component for OTP resend functionality with countdown timer
 * Used by: AUTH-R02 (register), AUTH-R03 (verify email change), AUTH-R06 (settings)
 */

"use client";

import { Button } from "@/components/ui/button";

export interface OTPResendButtonProps {
  /** Countdown seconds remaining (0 = can resend) */
  countdown: number;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when resend is clicked */
  onResend: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * OTP Resend Button
 * Displays countdown timer and disables during cooldown period
 */
export function OTPResendButton({
  countdown,
  isLoading = false,
  onResend,
  className = "",
}: OTPResendButtonProps) {
  const canResend = countdown === 0 && !isLoading;

  const handleClick = () => {
    if (canResend) {
      onResend();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={!canResend}
        className="w-full"
      >
        {isLoading
          ? "กำลังส่ง..."
          : countdown > 0
            ? `ส่งรหัสใหม่ได้ในอีก ${countdown} วินาที`
            : "ส่งรหัสใหม่"}
      </Button>

      {countdown > 0 && (
        <p className="text-xs text-center text-gray-500">
          หากไม่ได้รับอีเมล กรุณาตรวจสอบโฟลเดอร์ขยะ (Spam)
        </p>
      )}
    </div>
  );
}
