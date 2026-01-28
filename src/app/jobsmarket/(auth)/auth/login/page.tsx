import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginCard } from "./_components";

/**
 * Login page metadata
 * Per AUTH-R01 Implementation Plan §7 (Thai Copy)
 */
export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  description: "เข้าสู่ระบบเพื่อจัดการประวัติและค้นหางาน",
};

/**
 * Login page - Server component wrapper
 * Per AUTH-R01 RIS
 *
 * Query parameters handled:
 * - ?redirect - Return URL after login
 * - ?from - Context message (session-expired, registration, protected, password-reset)
 * - ?method - Preferred login method (social, email)
 */
export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      {/* Suspense boundary for client components that use useSearchParams */}
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-lg border bg-card animate-pulse" />
        }
      >
        <LoginCard />
      </Suspense>
    </div>
  );
}
