/**
 * Company Auth Form Component
 * Per AUTH-R02 Implementation Plan Section 3.1
 * Per RIS AUTH-R02 §6.2 - Company authentication (Email only)
 *
 * Step 2 for company flow: Email + Terms (no Google option for company)
 */

"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import {
  emailAtom,
  termsAcceptedAtom,
  employerTermsAcceptedAtom,
} from "@/store/jobsmarket/register-atoms";
import { checkEmailExists } from "@/domains/authentication/services/server/actions/jobsmarket/email-check-actions";

export interface CompanyAuthFormProps {
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Callback when email is submitted (triggers OTP send) */
  onEmailSubmit: (email: string) => Promise<void>;
  /** Callback to go back */
  onBack?: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * Company Auth Form
 * Email-only authentication (no Google for company accounts)
 */
export function CompanyAuthForm({
  isLoading = false,
  error,
  onEmailSubmit,
  onBack,
  className = "",
}: CompanyAuthFormProps) {
  const [email, setEmail] = useAtom(emailAtom);
  const [termsAccepted, setTermsAccepted] = useAtom(termsAcceptedAtom);
  const [employerTermsAccepted, setEmployerTermsAccepted] = useAtom(
    employerTermsAcceptedAtom
  );
  const [emailError, setEmailError] = useState<string>("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  /**
   * Check email on blur (per Section 14 resolution)
   * 500ms debounce for better UX
   */
  const handleEmailBlur = async () => {
    if (!email || !isValidEmail(email)) {
      return;
    }

    setIsCheckingEmail(true);
    setEmailError("");

    // 500ms debounce
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const result = await checkEmailExists({ email });

      if (result.exists) {
        const method = result.method === "google" ? "Google" : "อีเมลและรหัสผ่าน";
        setEmailError(`อีเมลนี้ถูกใช้งานแล้ว (ลงทะเบียนด้วย ${method})`);
      }
    } catch (err) {
      console.error("Email check error:", err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (!isValidEmail(email)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      setEmailError("กรุณายอมรับข้อกำหนดและเงื่อนไข");
      return;
    }

    // Validate employer terms acceptance
    if (!employerTermsAccepted) {
      setEmailError("กรุณายอมรับข้อกำหนดสำหรับผู้ประกอบการ");
      return;
    }

    // Check email again on submit (final check)
    setIsCheckingEmail(true);
    try {
      const result = await checkEmailExists({ email });

      if (result.exists) {
        const method = result.method === "google" ? "Google" : "อีเมลและรหัสผ่าน";
        setEmailError(`อีเมลนี้ถูกใช้งานแล้ว (ลงทะเบียนด้วย ${method})`);
        setIsCheckingEmail(false);
        return;
      }
    } catch (err) {
      console.error("Email check error:", err);
    } finally {
      setIsCheckingEmail(false);
    }

    // Proceed with OTP send
    await onEmailSubmit(email);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">ยืนยันอีเมลธุรกิจ</h2>
        <p className="text-sm text-gray-600">
          กรุณาใช้อีเมลธุรกิจของบริษัทในการลงทะเบียน
        </p>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">อีเมลธุรกิจ</Label>
          <Input
            id="email"
            type="email"
            placeholder="hr@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={isLoading || isCheckingEmail}
            className={emailError || error ? "border-red-500" : ""}
          />
          <p className="text-xs text-gray-500">
            แนะนำให้ใช้อีเมลที่สังกัดองค์กรเท่านั้น (เช่น @company.com)
          </p>
          {(emailError || error) && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{emailError || error}</span>
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) =>
                setTermsAccepted(checked as boolean)
              }
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              ฉันยอมรับ{" "}
              <a
                href="/legal/terms-of-service"
                target="_blank"
                className="text-secondary-500 hover:text-secondary-600 hover:underline"
              >
                ข้อกำหนดและเงื่อนไข
              </a>{" "}
              และ{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-secondary-500 hover:text-secondary-600 hover:underline"
              >
                นโยบายความเป็นส่วนตัว
              </a>
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="employer-terms"
              checked={employerTermsAccepted}
              onCheckedChange={(checked) =>
                setEmployerTermsAccepted(checked as boolean)
              }
              disabled={isLoading}
            />
            <label
              htmlFor="employer-terms"
              className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              ฉันยอมรับ{" "}
              <a
                href="/legal/employer-terms"
                target="_blank"
                className="text-secondary-500 hover:text-secondary-600 hover:underline"
              >
                ข้อกำหนดสำหรับผู้ประกอบการ
              </a>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={
            !email ||
            !termsAccepted ||
            !employerTermsAccepted ||
            isLoading ||
            isCheckingEmail ||
            !!emailError
          }
        >
          {isCheckingEmail
            ? "กำลังตรวจสอบอีเมล..."
            : isLoading
              ? "กำลังส่งรหัส OTP..."
              : "ดำเนินการต่อ"}
        </Button>
      </form>

      {/* Back Button */}
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={isLoading}
        >
          ← ย้อนกลับ
        </Button>
      )}
    </div>
  );
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
