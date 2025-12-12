"use client";

import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/jobsmarket/use-login";

import { ContextMessage } from "./ContextMessage";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { EmailLoginForm } from "./EmailLoginForm";
import { SuspendedAccountCard } from "./SuspendedAccountCard";
import { RateLimitedCard } from "./RateLimitedCard";

/**
 * LoginCard - Main login card container
 * Per AUTH-R01 Implementation Plan
 * Orchestrates the login flow state machine
 */
export function LoginCard() {
  const {
    pageState,
    error,
    termsAccepted,
    contextMessage,
    preferredMethod,
    loginWithEmail,
    loginWithGoogle,
    setTermsAccepted,
    clearError,
    acknowledgeMessage,
  } = useLogin();

  // Loading states
  if (pageState === "check_auth") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Already authenticated - redirecting
  if (pageState === "already_auth" || pageState === "redirecting") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            กำลังนำคุณไปยังหน้าหลัก...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Routing state - determining destination
  if (pageState === "routing") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            กำลังตรวจสอบข้อมูล...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Special error states
  if (error?.code === "account_suspended") {
    return <SuspendedAccountCard />;
  }

  if (error?.code === "rate_limited") {
    return (
      <RateLimitedCard
        onRetry={clearError}
        onCountdownComplete={clearError}
      />
    );
  }

  // Main login form (idle, show_message, authenticating, error states)
  const isLoading = pageState === "authenticating";
  const autoFocusEmail = preferredMethod === "email";
  const highlightGoogle = preferredMethod === "social";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
        <CardDescription>
          เข้าสู่ระบบเพื่อจัดการประวัติและค้นหางาน
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Context message */}
        {contextMessage && pageState === "show_message" && (
          <ContextMessage
            type={contextMessage}
            onDismiss={acknowledgeMessage}
          />
        )}

        {/* Error message */}
        {error && pageState === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Google login button */}
        <GoogleLoginButton
          onClick={loginWithGoogle}
          disabled={isLoading}
          loading={isLoading}
          className={highlightGoogle ? "ring-2 ring-primary ring-offset-2" : undefined}
        />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              หรือ
            </span>
          </div>
        </div>

        {/* Email login form */}
        <EmailLoginForm
          onSubmit={loginWithEmail}
          disabled={isLoading}
          loading={isLoading}
          termsAccepted={termsAccepted}
          onTermsChange={setTermsAccepted}
          autoFocusEmail={autoFocusEmail}
        />
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/jobsmarket/auth/register"
            className="text-primary hover:underline font-medium"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginCard;
