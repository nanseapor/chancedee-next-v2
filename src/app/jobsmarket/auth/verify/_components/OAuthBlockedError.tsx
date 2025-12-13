/**
 * OAuth Blocked Error Component
 * Per RIS AUTH-R03 Section 9.0
 *
 * Shows when OAuth-only users try to change their account email.
 * OAuth users (Google, Facebook) cannot change their login email.
 */

"use client";

import Link from "next/link";

export function OAuthBlockedError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-100 p-3">
            <svg
              className="h-12 w-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          ไม่สามารถเปลี่ยนอีเมลได้
        </h1>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-gray-600">
            บัญชีนี้ใช้ Google เข้าสู่ระบบ ไม่สามารถเปลี่ยนอีเมลสำหรับเข้าสู่ระบบได้
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
            <p className="font-semibold text-blue-900 mb-2">
              💡 ทำไมไม่สามารถเปลี่ยนได้?
            </p>
            <p className="text-blue-800">
              เมื่อคุณเข้าสู่ระบบด้วย Google อีเมลจะเชื่อมโยงกับบัญชี Google ของคุณโดยตรง
              หากต้องการเข้าสู่ระบบด้วยอีเมลอื่น กรุณาสร้างรหัสผ่านก่อน
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับหน้าหลัก
          </Link>

          <Link
            href="/auth/settings"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ไปที่ตั้งค่าบัญชี
          </Link>
        </div>
      </div>
    </div>
  );
}
