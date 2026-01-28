"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

import { ResetForm } from "./ResetForm";
import { ResetSuccess } from "./ResetSuccess";
import { getFirebaseErrorMessage } from "@/domains/authentication/utils/error-messages";

/**
 * Page state type per AUTH-R04 RIS §5.3
 */
type PageState = "idle" | "submitting" | "success" | "error";

/**
 * Error type per AUTH-R04 RIS Appendix A
 */
interface ResetError {
  code: string;
  message: string;
  showRegisterLink?: boolean;
}

/**
 * ResetClient - Client component orchestrator for password reset flow
 * Per AUTH-R04 RIS §7 (State Machine)
 *
 * State Machine:
 * IDLE → SUBMITTING → SUCCESS | ERROR
 *
 * Implements Firebase client-side password reset per BLS-01 §3.5
 */
export function ResetClient() {
  const searchParams = useSearchParams();

  // Pre-fill email from query param (from login page "ลืมรหัสผ่าน?" link)
  // Per AUTH-R04 RIS §6
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [pageState, setPageState] = useState<PageState>("idle");
  const [error, setError] = useState<ResetError | null>(null);

  /**
   * Handle password reset email submission
   * Per BLS-01 §3.5 - Uses Firebase Auth directly
   */
  const handleSubmit = async (submittedEmail: string) => {
    setEmail(submittedEmail);
    setPageState("submitting");
    setError(null);

    try {
      const auth = getAuth();

      // Action code settings - redirect to login after password reset
      // Per AUTH-R04 RIS §4.3
      const actionCodeSettings = {
        url: `${window.location.origin}/jobsmarket/auth/login`,
        handleCodeInApp: false,
      };

      // Call Firebase to send password reset email
      // Per BLS-01 §3.5 Data Effects Step 1
      await sendPasswordResetEmail(auth, submittedEmail, actionCodeSettings);

      // Success - show confirmation
      // Per AUTH-R04 RIS §7.2 (SUBMITTING → SUCCESS)
      setPageState("success");
    } catch (err: unknown) {
      // Error handling per AUTH-R04 RIS §10.1
      const firebaseError = err as { code?: string; message?: string };
      const errorCode = firebaseError.code || "UNKNOWN_ERROR";

      // Map Firebase error to Thai message
      const errorMessage = getFirebaseErrorMessage(errorCode);

      // Show register link for user-not-found
      // Per AUTH-R04 RIS §10.3
      const showRegisterLink = errorCode === "auth/user-not-found";

      setError({
        code: errorMessage.code,
        message: errorMessage.message,
        showRegisterLink,
      });

      setPageState("error");
    }
  };

  /**
   * Handle resend from success state
   * Per AUTH-R04 RIS §7.2 (SUCCESS → SUBMITTING)
   */
  const handleResend = () => {
    handleSubmit(email);
  };

  // Show success state
  // Per AUTH-R04 RIS §8.3
  if (pageState === "success") {
    return <ResetSuccess email={email} onResend={handleResend} />;
  }

  // Show form (idle or error state)
  // Per AUTH-R04 RIS §8.1, §8.4
  // Note: Error state keeps form visible with error message
  return (
    <ResetForm
      initialEmail={email}
      isSubmitting={pageState === "submitting"}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
