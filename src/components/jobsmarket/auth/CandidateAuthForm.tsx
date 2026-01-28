/**
 * Candidate Auth Form Component
 * Per AUTH-R02 Implementation Plan Section 3.1
 * Per RIS AUTH-R02 §6.1 - Candidate authentication (Google OR Email)
 *
 * Step 2 for candidate flow: Choose Google OAuth or Email/Password
 */

"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { emailAtom, termsAcceptedAtom } from "@/store/jobsmarket/register-atoms";
import { checkEmailExists } from "@/domains/authentication/services/server/actions/jobsmarket/email-check-actions";

export interface CandidateAuthFormProps {
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Callback when Google auth is clicked */
  onGoogleAuth: () => void;
  /** Callback when email is submitted (triggers OTP send) */
  onEmailSubmit: (email: string) => Promise<void>;
  /** Optional class name */
  className?: string;
}

/**
 * Candidate Auth Form
 * Shows Google button OR email input + terms checkbox
 */
export function CandidateAuthForm({
  isLoading = false,
  error,
  onGoogleAuth,
  onEmailSubmit,
  className = "",
}: CandidateAuthFormProps) {
  const [email, setEmail] = useAtom(emailAtom);
  const [termsAccepted, setTermsAccepted] = useAtom(termsAcceptedAtom);
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
        <h2 className="text-2xl font-semibold">สมัครสมาชิกผู้หางาน</h2>
        <p className="text-sm text-gray-600">
          เลือกวิธีการลงทะเบียนของคุณ
        </p>
      </div>

      {/* Google Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleAuth}
        disabled={isLoading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        ดำเนินการต่อด้วย Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            หรือ
          </span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">อีเมล</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={isLoading || isCheckingEmail}
            className={emailError || error ? "border-red-500" : ""}
          />
          {(emailError || error) && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{emailError || error}</span>
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={
            !email ||
            !termsAccepted ||
            isLoading ||
            isCheckingEmail ||
            !!emailError
          }
        >
          {isCheckingEmail
            ? "กำลังตรวจสอบอีเมล..."
            : isLoading
              ? "กำลังส่งรหัส OTP..."
              : "ดำเนินการต่อด้วยอีเมล"}
        </Button>
      </form>

      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => window.history.back()}
        disabled={isLoading}
      >
        ← ย้อนกลับ
      </Button>
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
