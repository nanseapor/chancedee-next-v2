/**
 * AUTH-R03: Email Verification Page
 * Route: /auth/verify
 *
 * Per RIS AUTH-R03
 * Per AUTH-R03 Implementation Plan
 *
 * Purpose: Verify new email address via OTP
 * Three use cases:
 * 1. account - Change Firebase Auth login email (password users only)
 * 2. candidate-contact - Update resume/profile email
 * 3. company-contact - Update job posting email
 *
 * Query Parameters:
 * - purpose: "account" | "candidate-contact" | "company-contact" (required)
 * - email: New email address (required)
 * - entityId: Company ID (required for company-contact)
 * - redirect: Post-success redirect (optional, relative paths only)
 */

import { redirect } from "next/navigation";
import { verifySessionCookie } from "@/utils/auth";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { VerifyClient } from "./_components/VerifyClient";
import { OAuthBlockedError } from "./_components/OAuthBlockedError";
import { AuthError } from "./_components/AuthError";

/**
 * Verify page props
 */
interface VerifyPageProps {
  searchParams: Promise<{
    purpose?: string;
    email?: string;
    entityId?: string;
    redirect?: string;
  }>;
}

/**
 * Email verification page (Server Component)
 *
 * Server-side checks:
 * 1. Session validation
 * 2. Query parameter validation
 * 3. Purpose-specific authorization
 * 4. OAuth provider detection (for account purpose)
 *
 * Client-side flow (VerifyClient):
 * 1. Send OTP automatically
 * 2. Show OTP input form
 * 3. Verify OTP
 * 4. Update email (purpose-specific action)
 * 5. Show success + redirect
 */
export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;

  // ========================================
  // STEP 1: Validate query parameters
  // ========================================

  const { purpose, email, entityId, redirect: redirectParam } = params;

  // Validate purpose
  if (!purpose) {
    return (
      <AuthError
        errorCode="MISSING_PURPOSE"
        message="ไม่พบวัตถุประสงค์ กรุณาเข้าถึงหน้านี้จากลิงก์ที่ถูกต้อง"
        backLink="/"
      />
    );
  }

  if (!["account", "candidate-contact", "company-contact"].includes(purpose)) {
    return (
      <AuthError
        errorCode="INVALID_PURPOSE"
        message="วัตถุประสงค์ไม่ถูกต้อง"
        backLink="/"
      />
    );
  }

  // Validate email
  if (!email) {
    return (
      <AuthError
        errorCode="MISSING_EMAIL"
        message="ไม่พบอีเมลที่ต้องการยืนยัน"
        backLink="/"
      />
    );
  }

  // Simple email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return (
      <AuthError
        errorCode="INVALID_EMAIL"
        message="รูปแบบอีเมลไม่ถูกต้อง"
        backLink="/"
      />
    );
  }

  // Validate entityId for company-contact
  if (purpose === "company-contact" && !entityId) {
    return (
      <AuthError
        errorCode="MISSING_ENTITY_ID"
        message="ไม่พบข้อมูลบริษัท"
        backLink="/"
      />
    );
  }

  // Sanitize redirect (relative paths only, not protocol-relative)
  let sanitizedRedirect: string | undefined;
  if (
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
  ) {
    sanitizedRedirect = redirectParam;
  }

  // ========================================
  // STEP 2: Authenticate session
  // ========================================

  const session = await verifySessionCookie();

  if (!session?.uid) {
    // Session expired - redirect to session-expired page
    redirect("/auth/session-expired");
  }

  const { uid } = session;

  // ========================================
  // STEP 3: Purpose-specific authorization
  // ========================================

  if (purpose === "account") {
    // Check if OAuth-only user
    const auth = getFirebaseAdminAuth();
    const firebaseUser = await auth.getUser(uid);

    const providers = firebaseUser.providerData.map((p) => p.providerId);
    const hasPasswordProvider = providers.includes("password");

    if (!hasPasswordProvider) {
      // OAuth-only user (Google, Facebook, etc.)
      return <OAuthBlockedError />;
    }
  } else if (purpose === "candidate-contact") {
    // Check if user has candidate role
    const auth = getFirebaseAdminAuth();
    const firebaseUser = await auth.getUser(uid);
    const customClaims = firebaseUser.customClaims || {};
    const roles = (customClaims.roles as string[]) || [];
    const candidateId = customClaims.candidateId as string | undefined;

    if (!roles.includes("candidate") || !candidateId) {
      return (
        <AuthError
          errorCode="ROLE_UNAUTHORIZED"
          message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องมีบทบาทผู้สมัครงาน)"
          backLink="/"
        />
      );
    }
  } else if (purpose === "company-contact") {
    // Check if user has admin role
    const auth = getFirebaseAdminAuth();
    const firebaseUser = await auth.getUser(uid);
    const customClaims = firebaseUser.customClaims || {};
    const roles = (customClaims.roles as string[]) || [];
    const companyId = customClaims.companyId as string | undefined;

    if (!roles.includes("admin")) {
      return (
        <AuthError
          errorCode="ROLE_UNAUTHORIZED"
          message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องมีบทบาทผู้ดูแลระบบ)"
          backLink="/"
        />
      );
    }

    // IDOR prevention: Check if entityId matches session companyId
    if (entityId && companyId !== entityId) {
      return (
        <AuthError
          errorCode="UNAUTHORIZED_ENTITY"
          message="คุณไม่มีสิทธิ์แก้ไขข้อมูลบริษัทนี้"
          backLink="/"
        />
      );
    }
  }

  // ========================================
  // STEP 4: Determine default redirect
  // ========================================

  let defaultRedirect: string;
  switch (purpose) {
    case "account":
      // AUTH-R06: Settings page
      defaultRedirect = "/auth/settings";
      break;
    case "candidate-contact": {
      // CAND-R02: Candidate profile page
      // Get candidateId from custom claims (already validated above)
      const authCandidate = getFirebaseAdminAuth();
      const candidateUser = await authCandidate.getUser(uid);
      const candidateClaims = candidateUser.customClaims || {};
      const candidateId = candidateClaims.candidateId as string;
      defaultRedirect = `/candidates/${candidateId}/profile`;
      break;
    }
    case "company-contact": {
      // COMP-R03: Company settings page
      // Get companyId from session
      const authCompany = getFirebaseAdminAuth();
      const companyUser = await authCompany.getUser(uid);
      const companyClaims = companyUser.customClaims || {};
      const companyId = (companyClaims.companyId as string) || entityId;
      defaultRedirect = `/companies/${companyId}/dashboard/settings`;
      break;
    }
    default:
      defaultRedirect = "/";
  }

  const finalRedirect = sanitizedRedirect || defaultRedirect;

  // ========================================
  // STEP 5: Render client component
  // ========================================

  return (
    <VerifyClient
      purpose={purpose as "account" | "candidate-contact" | "company-contact"}
      email={email.toLowerCase()}
      entityId={entityId}
      redirect={finalRedirect}
    />
  );
}
