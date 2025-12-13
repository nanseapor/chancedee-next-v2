/**
 * Generic Auth Error Component
 * Per RIS AUTH-R03 Section 9
 *
 * Shows authorization and validation errors with appropriate messages.
 */

"use client";

import Link from "next/link";

interface AuthErrorProps {
  errorCode: string;
  message: string;
  backLink?: string;
}

export function AuthError({ errorCode, message, backLink = "/" }: AuthErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="h-12 w-12 text-red-600"
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
        <h1 className="text-2xl font-bold text-gray-900">เกิดข้อผิดพลาด</h1>

        {/* Error message */}
        <div className="space-y-4">
          <p className="text-gray-600">{message}</p>

          {/* Error code (for debugging) */}
          <p className="text-xs text-gray-400 font-mono">
            รหัสข้อผิดพลาด: {errorCode}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={backLink}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับหน้าที่แล้ว
          </Link>
        </div>
      </div>
    </div>
  );
}
