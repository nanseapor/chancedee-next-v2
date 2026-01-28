import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetClient } from "./_components/ResetClient";

/**
 * Password Reset page metadata
 * Per AUTH-R04 Implementation Plan §6 (Thai Copy)
 */
export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน",
  description: "รีเซ็ตรหัสผ่านบัญชี ChanceDee",
};

/**
 * Password Reset page - Server component wrapper
 * Per AUTH-R04 RIS
 *
 * Query parameters handled:
 * - ?email - Pre-fill email field (from login page "ลืมรหัสผ่าน?" link)
 *
 * Firebase Flow:
 * 1. User submits email
 * 2. Client calls Firebase `sendPasswordResetEmail()`
 * 3. Firebase sends email with reset link
 * 4. User clicks link → Firebase-hosted password reset form
 * 5. After reset → redirects to /auth/login
 */
export default function ResetPage() {
  return (
    <div className="w-full max-w-md">
      {/* Suspense boundary for client components that use useSearchParams */}
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-lg border bg-card animate-pulse" />
        }
      >
        <ResetClient />
      </Suspense>
    </div>
  );
}
