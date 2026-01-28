"use client";

import { signInWithCustomToken } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";

import { getFirebaseAuth } from "@/lib/firebase";
import {
  activeRoleAtom,
  authenticatedUserIdAtom,
  sessionStateAtom,
} from "@/store/jobsmarket/global-atoms";

type TokenLoginState = "loading" | "success" | "error";

/**
 * TokenLoginClient - Handles programmatic sign-in using Firebase custom tokens
 *
 * This component is used for E2E tests to programmatically sign in users
 * without going through the UI login flow.
 *
 * Query parameters:
 * - token: Firebase custom token from test factory
 * - redirect: Optional redirect URL after login (default: dashboard)
 */
export function TokenLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = getFirebaseAuth();

  const [state, setState] = useState<TokenLoginState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Global state atoms
  const setActiveRole = useSetAtom(activeRoleAtom);
  const setSessionState = useSetAtom(sessionStateAtom);
  const setAuthenticatedUserId = useSetAtom(authenticatedUserIdAtom);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const performTokenLogin = async () => {
      const token = searchParams.get("token");
      const redirect = searchParams.get("redirect");

      if (!token) {
        setState("error");
        setErrorMessage("ไม่พบ token สำหรับเข้าสู่ระบบ");
        return;
      }

      try {
        // Sign in with custom token
        const userCredential = await signInWithCustomToken(auth, token);

        // Get ID token for server action
        const idToken = await userCredential.user.getIdToken();

        // Call server action to create session and get redirect URL
        const { loginWithPostRouting } = await import(
          "@/domains/authentication/services/server/actions/jobsmarket/login-action"
        );

        const result = await loginWithPostRouting({
          idToken,
          termsAccepted: true, // Test accounts auto-accept terms
        });

        if (!result.success) {
          setState("error");
          setErrorMessage(result.errorMessage || "เกิดข้อผิดพลาดหลังเข้าสู่ระบบ");
          return;
        }

        // Update global state
        setSessionState("authenticated");
        setAuthenticatedUserId(userCredential.user.uid);
        if (result.role) {
          setActiveRole(result.role);
        }

        setState("success");

        // Redirect to specified URL or default from server
        // Use window.location for more reliable redirect detection in E2E tests
        const destination = redirect || result.redirectUrl || "/jobsmarket";
        window.location.href = destination;
      } catch (err: unknown) {
        console.error("Token login failed:", err);
        setState("error");

        const errorCode = (err as { code?: string })?.code;
        if (errorCode === "auth/invalid-custom-token") {
          setErrorMessage("Token ไม่ถูกต้องหรือหมดอายุ");
        } else if (errorCode === "auth/custom-token-mismatch") {
          setErrorMessage("Token ไม่ตรงกับโปรเจค Firebase");
        } else {
          setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
      }
    };

    performTokenLogin();
  }, [
    searchParams,
    auth,
    router,
    setActiveRole,
    setSessionState,
    setAuthenticatedUserId,
  ]);

  if (state === "loading") {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600 mx-auto" />
        <p className="mt-4 text-gray-600">กำลังเข้าสู่ระบบ...</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium">{errorMessage}</p>
        <p className="mt-2 text-gray-500 text-sm">
          หน้านี้สำหรับใช้ในการทดสอบเท่านั้น
        </p>
      </div>
    );
  }

  // Success state - show briefly before redirect
  return (
    <div className="text-center">
      <div className="text-green-500 text-5xl mb-4">✓</div>
      <p className="text-green-600 font-medium">เข้าสู่ระบบสำเร็จ</p>
      <p className="mt-2 text-gray-500 text-sm">กำลังนำคุณไปยังหน้าถัดไป...</p>
    </div>
  );
}
