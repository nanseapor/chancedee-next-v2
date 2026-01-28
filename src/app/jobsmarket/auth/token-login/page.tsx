import { Suspense } from "react";
import { TokenLoginClient } from "./_components/TokenLoginClient";

/**
 * Token Login Page
 *
 * This page is used for E2E tests to programmatically sign in users
 * using Firebase custom tokens. It's not meant for production use.
 *
 * Query parameters:
 * - token: Firebase custom token from test factory
 * - redirect: Optional redirect URL after login (default: dashboard)
 */
export default function TokenLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600 mx-auto" />
            <p className="mt-4 text-gray-600">กำลังเข้าสู่ระบบ...</p>
          </div>
        }
      >
        <TokenLoginClient />
      </Suspense>
    </div>
  );
}
