/**
 * OTP Verify Form Component
 * Per AUTH-R02 Implementation Plan Section 2 (Shared Components)
 *
 * Shared component for OTP verification
 * Used by: AUTH-R02 (register), AUTH-R03 (verify email change), AUTH-R06 (settings)
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export interface OTPVerifyFormProps {
  /** Email address OTP was sent to */
  email: string;
  /** Reference code for the OTP */
  refCode: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message (Thai) */
  error?: string;
  /** Success callback with OTP code */
  onVerify: (otpCode: string) => Promise<void>;
  /** Optional class name */
  className?: string;
}

/**
 * OTP Verify Form
 * 6-digit OTP input with auto-focus and validation
 */
export function OTPVerifyForm({
  email,
  refCode,
  isLoading = false,
  error,
  onVerify,
  className = "",
}: OTPVerifyFormProps) {
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6 && !isLoading) {
      await onVerify(otpCode);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">ตรวจสอบอีเมล</h2>
        <p className="text-sm text-gray-600">
          กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยัง{" "}
          <span className="font-medium">{email}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="space-y-2">
        <Label htmlFor="otp-code">รหัส OTP</Label>
        <Input
          id="otp-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="000000"
          value={otpCode}
          onChange={handleOTPChange}
          disabled={isLoading}
          autoFocus
          autoComplete="one-time-code"
          className={`text-center text-2xl tracking-widest ${
            error ? "border-red-500" : ""
          }`}
          maxLength={6}
        />
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Reference Code */}
      <div className="space-y-2">
        <Label htmlFor="ref-code" className="text-sm text-gray-600">
          รหัสอ้างอิง
        </Label>
        <Input
          id="ref-code"
          type="text"
          value={refCode}
          disabled
          readOnly
          className="text-center font-mono text-sm bg-gray-50"
        />
      </div>

      {/* Verify Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={otpCode.length !== 6 || isLoading}
      >
        {isLoading ? "กำลังตรวจสอบ..." : "ยืนยัน"}
      </Button>
    </form>
  );
}
