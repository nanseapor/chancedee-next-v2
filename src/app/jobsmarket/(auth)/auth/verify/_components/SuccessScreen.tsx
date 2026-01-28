/**
 * Success Screen Component
 * Per RIS AUTH-R03 Section 10.2
 *
 * Shows success message after email verification and auto-redirects.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SuccessScreenProps {
  email: string;
  redirect: string;
}

export function SuccessScreen({ email, redirect }: SuccessScreenProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(redirect);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          ยืนยันอีเมลสำเร็จ
        </h1>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-gray-600">
            อีเมลของคุณได้รับการยืนยันเรียบร้อยแล้ว
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <span className="font-semibold">อีเมลใหม่:</span> {email}
            </p>
          </div>

          {/* Countdown */}
          <p className="text-sm text-gray-500">
            กำลังนำคุณกลับไปยังหน้าเดิมใน {countdown} วินาที...
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
