"use client";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getFirebaseAuth } from "@/lib/firebase";
import {
  activeRoleAtom,
  authenticatedUserIdAtom,
  sessionStateAtom,
} from "@/store/jobsmarket/global-atoms";
import {
  contextMessageAtom,
  loginErrorAtom,
  loginPageStateAtom,
  preferredMethodAtom,
  redirectUrlAtom,
  termsAcceptedAtom,
  type ContextFromType,
  type LoginError,
  type LoginPageState,
} from "@/store/jobsmarket/auth-atoms";

/**
 * Login hook return type
 */
interface UseLoginReturn {
  // State
  pageState: LoginPageState;
  error: LoginError | null;
  termsAccepted: boolean;
  contextMessage: ContextFromType | null;
  preferredMethod: "social" | "email" | null;

  // Actions
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  setTermsAccepted: (accepted: boolean) => void;
  clearError: () => void;
  acknowledgeMessage: () => void;
}

/**
 * useLogin hook - Orchestrates the login flow
 * Per AUTH-R01 Implementation Plan §3.3
 *
 * State machine transitions:
 * - check_auth → already_auth | show_message | idle
 * - idle → authenticating (on submit)
 * - authenticating → routing | error
 * - routing → redirecting
 * - error → idle (on retry)
 * - show_message → idle (on acknowledge)
 */
export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = getFirebaseAuth();

  // Atoms
  const [pageState, setPageState] = useAtom(loginPageStateAtom);
  const [error, setError] = useAtom(loginErrorAtom);
  const [termsAccepted, setTermsAcceptedAtom] = useAtom(termsAcceptedAtom);
  const [contextMessage, setContextMessage] = useAtom(contextMessageAtom);
  const [redirectUrl, setRedirectUrl] = useAtom(redirectUrlAtom);
  const [preferredMethod, setPreferredMethod] = useAtom(preferredMethodAtom);
  const setActiveRole = useSetAtom(activeRoleAtom);
  const setSessionState = useSetAtom(sessionStateAtom);
  const setAuthenticatedUserId = useSetAtom(authenticatedUserIdAtom);

  const initialized = useRef(false);
  const queryParamsRef = useRef<{
    context: "candidate" | "company" | "admin" | null;
    invite: string | null;
    refCode: string | null;
    jobId: string | null;
  }>({
    context: null,
    invite: null,
    refCode: null,
    jobId: null,
  });

  /**
   * Initialize login page - check auth and parse query params
   */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeLogin = async () => {
      // Parse query parameters per AUTH-R01 Plan §6.1
      const fromParam = searchParams.get("from") as ContextFromType | null;
      const redirectParam = searchParams.get("redirect");
      const methodParam = searchParams.get("method") as "social" | "email" | null;

      // Store additional params for server action
      const contextParam = searchParams.get("context") as "candidate" | "company" | "admin" | null;
      const inviteParam = searchParams.get("invite");
      const refCodeParam = searchParams.get("refCode");
      const jobIdParam = searchParams.get("jobId");

      if (redirectParam) {
        // Validate redirect URL per RIS §7.1
        if (isValidRedirectUrl(redirectParam)) {
          setRedirectUrl(redirectParam);
        } else {
          console.warn("Invalid redirect URL blocked:", redirectParam);
        }
      }
      if (methodParam) {
        setPreferredMethod(methodParam);
      }

      // Store query params in ref for later use
      queryParamsRef.current = {
        context: contextParam,
        invite: inviteParam,
        refCode: refCodeParam,
        jobId: jobIdParam,
      };

      // Check for existing session
      const currentUser = auth.currentUser;
      if (currentUser) {
        setPageState("already_auth");
        setSessionState("authenticated");
        setAuthenticatedUserId(currentUser.uid);
        router.replace(redirectParam || "/jobsmarket");
        return;
      }

      // Handle ?from parameter
      if (fromParam && isValidFromParam(fromParam)) {
        setContextMessage(fromParam);
        setPageState("show_message");
      } else {
        setPageState("idle");
      }

      setSessionState("unauthenticated");
    };

    initializeLogin();
  }, [searchParams, auth, router, setPageState, setSessionState, setAuthenticatedUserId, setContextMessage, setRedirectUrl, setPreferredMethod]);

  /**
   * Validate ?from parameter
   */
  const isValidFromParam = (value: string): value is ContextFromType => {
    return ["session-expired", "registration", "protected", "password-reset"].includes(value);
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = useCallback(async (userCredential: UserCredential) => {
    setPageState("routing");

    try {
      // Get ID token for server action
      const idToken = await userCredential.user.getIdToken();

      // Import server action dynamically to avoid server/client boundary issues
      const { loginWithPostRouting } = await import(
        "@/domains/authentication/services/server/actions/jobsmarket/login-action"
      );

      const result = await loginWithPostRouting({
        idToken,
        termsAccepted,
        context: queryParamsRef.current.context ?? undefined,
        refCode: queryParamsRef.current.refCode,
        jobId: queryParamsRef.current.jobId,
      });

      if (!result.success) {
        setError({
          code: result.errorCode || "unknown",
          message: result.errorMessage || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        });
        setPageState("error");
        return;
      }

      // Update global state
      setSessionState("authenticated");
      setAuthenticatedUserId(userCredential.user.uid);
      if (result.role) {
        setActiveRole(result.role);
      }

      // Redirect to appropriate destination
      setPageState("redirecting");
      const destination = redirectUrl || result.redirectUrl || "/jobsmarket";
      router.replace(destination);
    } catch (err) {
      console.error("Post-login routing failed:", err);
      setError({
        code: "routing_failed",
        message: "เกิดข้อผิดพลาดหลังจากเข้าสู่ระบบ",
      });
      setPageState("error");
    }
  }, [termsAccepted, redirectUrl, router, setPageState, setError, setSessionState, setAuthenticatedUserId, setActiveRole]);

  /**
   * Login with email and password
   */
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!termsAccepted) {
      setError({
        code: "terms_not_accepted",
        message: "กรุณายอมรับข้อกำหนดและนโยบาย",
      });
      setPageState("error");
      return;
    }

    setPageState("authenticating");
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess(userCredential);
    } catch (err: unknown) {
      console.error("Email login failed:", err);
      const errorCode = (err as { code?: string })?.code ?? "unknown";
      setError(mapFirebaseError(errorCode));
      setPageState("error");
    }
  }, [auth, termsAccepted, handleAuthSuccess, setPageState, setError]);

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(async () => {
    if (!termsAccepted) {
      setError({
        code: "terms_not_accepted",
        message: "กรุณายอมรับข้อกำหนดและนโยบาย",
      });
      setPageState("error");
      return;
    }

    setPageState("authenticating");
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleAuthSuccess(userCredential);
    } catch (err: unknown) {
      console.error("Google login failed:", err);
      const errorCode = (err as { code?: string })?.code;

      // Handle popup blocked
      if (errorCode === "auth/popup-blocked") {
        setError({
          code: "popup_blocked",
          message: "Popup ถูกบล็อก กรุณาอนุญาต popup แล้วลองใหม่",
        });
      } else if (errorCode === "auth/popup-closed-by-user") {
        // User closed popup - just return to idle
        setPageState("idle");
        return;
      } else {
        setError(mapFirebaseError(errorCode ?? "unknown"));
      }
      setPageState("error");
    }
  }, [auth, termsAccepted, handleAuthSuccess, setPageState, setError]);

  /**
   * Set terms accepted state
   */
  const setTermsAccepted = useCallback((accepted: boolean) => {
    setTermsAcceptedAtom(accepted);
    // Clear terms error if accepting
    if (accepted && error?.code === "terms_not_accepted") {
      setError(null);
    }
  }, [setTermsAcceptedAtom, error, setError]);

  /**
   * Clear error and return to idle state
   */
  const clearError = useCallback(() => {
    setError(null);
    setPageState("idle");
  }, [setError, setPageState]);

  /**
   * Acknowledge context message and proceed to idle
   */
  const acknowledgeMessage = useCallback(() => {
    setContextMessage(null);
    setPageState("idle");
  }, [setContextMessage, setPageState]);

  return {
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
  };
}

/**
 * Map Firebase error codes to Thai error messages
 * Per AUTH-R01 Plan §7
 */
function mapFirebaseError(code: string): LoginError {
  const errorMap: Record<string, LoginError> = {
    "auth/invalid-credential": {
      code: "invalid_credentials",
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    },
    "auth/invalid-email": {
      code: "invalid_email",
      message: "รูปแบบอีเมลไม่ถูกต้อง",
    },
    "auth/user-disabled": {
      code: "account_suspended",
      message: "บัญชีนี้ถูกระงับชั่วคราว",
    },
    "auth/user-not-found": {
      code: "user_not_found",
      message: "ไม่พบบัญชีผู้ใช้นี้",
    },
    "auth/wrong-password": {
      code: "wrong_password",
      message: "รหัสผ่านไม่ถูกต้อง",
    },
    "auth/too-many-requests": {
      code: "rate_limited",
      message: "คุณลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่",
    },
    "auth/network-request-failed": {
      code: "network_error",
      message: "เกิดปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่",
    },
    "auth/popup-blocked": {
      code: "popup_blocked",
      message: "Popup ถูกบล็อก กรุณาอนุญาต popup แล้วลองใหม่",
    },
    "auth/account-exists-with-different-credential": {
      code: "account_exists",
      message: "มีบัญชีที่ใช้อีเมลนี้แล้ว กรุณาเข้าสู่ระบบด้วยวิธีอื่น",
    },
  };

  return (
    errorMap[code] || {
      code: "unknown",
      message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง",
    }
  );
}

/**
 * Validate redirect URL against whitelist
 * Per AUTH-R01 RIS §7.1
 */
function isValidRedirectUrl(url: string): boolean {
  // Must be relative path (not absolute URL)
  if (!url.startsWith("/")) {
    return false;
  }

  // Block URLs with protocol or domain
  if (url.includes("://") || url.startsWith("//")) {
    return false;
  }

  // Whitelist allowed path patterns per RIS §7.1
  const allowedPatterns = [
    /^\/jobsmarket\/candidates\/.*/,
    /^\/jobsmarket\/companies\/.*/,
    /^\/jobsmarket\/jobs\/.*/,
    /^\/jobsmarket\/chat.*/,
    /^\/jobsmarket\/notifications.*/,
    /^\/jobsmarket\/auth\/.*/,
    /^\/platform\/.*/,
  ];

  return allowedPatterns.some((pattern) => pattern.test(url));
}

export default useLogin;
