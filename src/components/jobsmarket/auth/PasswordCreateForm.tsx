/**
 * Password Create Form Component
 * Per AUTH-R02 Implementation Plan Section 3.1
 * Per BLS-01 §6 Password Validation Rules
 *
 * Step after OTP verification: Create password for email flow
 */

"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { passwordAtom, confirmPasswordAtom } from "@/store/jobsmarket/register-atoms";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import {
  isPasswordValid,
  doPasswordsMatch,
} from "@/hooks/jobsmarket/use-password-strength";

export interface PasswordCreateFormProps {
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Callback when password is submitted */
  onSubmit: (password: string) => Promise<void>;
  /** Optional class name */
  className?: string;
}

/**
 * Password Create Form
 * Password + Confirm Password with strength meter
 */
export function PasswordCreateForm({
  isLoading = false,
  error,
  onSubmit,
  className = "",
}: PasswordCreateFormProps) {
  const [password, setPassword] = useAtom(passwordAtom);
  const [confirmPassword, setConfirmPassword] = useAtom(confirmPasswordAtom);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate password meets requirements
    if (!isPasswordValid(password)) {
      setValidationError(
        "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ"
      );
      return;
    }

    // Validate passwords match
    if (!doPasswordsMatch(password, confirmPassword)) {
      setValidationError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    await onSubmit(password);
  };

  const isValid =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    isPasswordValid(password) &&
    doPasswordsMatch(password, confirmPassword);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">สร้างรหัสผ่าน</h2>
        <p className="text-sm text-gray-600">
          กรุณาสร้างรหัสผ่านสำหรับบัญชีของคุณ
        </p>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="กรอกรหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className={validationError || error ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Password Strength Meter */}
      <PasswordStrengthMeter password={password} />

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className={validationError || error ? "border-red-500 pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Match Indicator */}
        {confirmPassword.length > 0 && (
          <p
            className={`text-sm ${
              doPasswordsMatch(password, confirmPassword)
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {doPasswordsMatch(password, confirmPassword)
              ? "✓ รหัสผ่านตรงกัน"
              : "✗ รหัสผ่านไม่ตรงกัน"}
          </p>
        )}
      </div>

      {/* Error Display */}
      {(validationError || error) && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isValid || isLoading}
      >
        {isLoading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
      </Button>
    </form>
  );
}
