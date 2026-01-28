"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

/**
 * AUTH-R08: Session Expired Page
 *
 * Displays session expiry notification and provides re-login path.
 * Triggered when:
 * - Middleware detects expired/invalid session cookie
 * - useSessionRenewal hook detects expiry
 * - User navigates to protected route after session expired
 *
 * Per RIS AUTH-R08 v1.2
 */
export default function SessionExpiredPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  // Construct login URL with optional redirect parameter
  const loginUrl = redirectUrl
    ? `/jobsmarket/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    : "/jobsmarket/auth/login";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          ChanceDee
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-amber-50 rounded-full p-4">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            เซสชันหมดอายุ
          </h1>
          <p className="text-sm text-gray-500">Session Expired</p>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="text-gray-700 mb-2">เซสชันของคุณหมดอายุแล้ว</p>
          <p className="text-gray-600 text-sm">
            กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Primary Button - Re-login */}
          <Button asChild className="w-full" size="lg">
            <Link href={loginUrl}>เข้าสู่ระบบอีกครั้ง</Link>
          </Button>

          {/* Secondary Link - Go Home */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500">
        <Link
          href="/legal/terms"
          className="hover:text-gray-700 transition-colors"
        >
          ข้อกำหนดการใช้งาน
        </Link>
        <span className="mx-2">|</span>
        <Link
          href="/privacy"
          className="hover:text-gray-700 transition-colors"
        >
          นโยบายความเป็นส่วนตัว
        </Link>
      </div>
    </div>
  );
}
