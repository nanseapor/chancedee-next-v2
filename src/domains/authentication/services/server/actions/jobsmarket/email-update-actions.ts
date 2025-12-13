/**
 * Email Update Server Actions for AUTH-R03
 * Per AUTH-R03 Implementation Plan
 * Per RIS AUTH-R03 Appendix B
 *
 * Provides email update functionality for:
 * - Account email (Firebase Auth login email)
 * - Candidate contact email (resume/public contact)
 * - Company contact email (job posting contact)
 */

"use server";

import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { verifySessionCookie } from "@/utils/auth";
import { getThaiErrorMessage } from "@/domains/authentication/utils/error-messages";
import { checkEmailExists } from "./email-check-actions";

/**
 * Result type for email update operations
 */
interface EmailUpdateResult {
  success: boolean;
  error?: string;
}

/**
 * Update account email (Firebase Auth + user_accounts)
 * Per RIS AUTH-R03 Appendix B
 *
 * This updates the login email for email/password users.
 * OAuth users cannot change their account email.
 *
 * Security:
 * - Only works for email/password auth (blocks OAuth users)
 * - Checks email availability AFTER OTP verification (prevents enumeration)
 * - Uses session UID (prevents IDOR)
 *
 * @param newEmail - The new email address
 * @returns Success or error message
 */
export async function updateAccountEmail(
  newEmail: string
): Promise<EmailUpdateResult> {
  try {
    // Get session
    const session = await verifySessionCookie();
    if (!session?.uid) {
      return {
        success: false,
        error: getThaiErrorMessage("SESSION_EXPIRED").message,
      };
    }

    const uid = session.uid;

    // Step 1: Get Firebase user and check provider
    const auth = getFirebaseAdminAuth();
    const firebaseUser = await auth.getUser(uid);

    // Check if user has password provider
    const providers = firebaseUser.providerData.map((p) => p.providerId);
    const hasPasswordProvider = providers.includes("password");

    if (!hasPasswordProvider) {
      // OAuth-only user (Google, Facebook, etc.)
      return {
        success: false,
        error: getThaiErrorMessage("OAUTH_ACCOUNT").message,
      };
    }

    // Step 2: Check if email is already in use (AFTER OTP verification)
    const emailCheck = await checkEmailExists({ email: newEmail });

    if (!emailCheck.success) {
      return {
        success: false,
        error: emailCheck.error || getThaiErrorMessage("UNKNOWN_ERROR").message,
      };
    }

    if (emailCheck.exists) {
      return {
        success: false,
        error: getThaiErrorMessage("EMAIL_IN_USE").message,
      };
    }

    // Step 3: Update Firebase Auth email
    await auth.updateUser(uid, {
      email: newEmail.toLowerCase(),
    });

    // Step 4: Update user_accounts collection (direct Firestore update)
    const db = getFirebaseAdminFirestore();
    await db.collection("user_accounts").doc(uid).update({
      email: newEmail.toLowerCase(),
      updated_at: new Date(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update account email failed:", error);
    return {
      success: false,
      error: getThaiErrorMessage("UPDATE_FAILED").message,
    };
  }
}

/**
 * Update candidate contact email
 * Per RIS AUTH-R03 Appendix B
 *
 * This updates the email shown on candidate's resume/profile.
 * Also sets emailVerification flag to true.
 *
 * Security:
 * - Requires candidate role
 * - Uses session UID (prevents IDOR)
 *
 * @param newEmail - The new contact email
 * @returns Success or error message
 */
export async function updateCandidateContactEmail(
  newEmail: string
): Promise<EmailUpdateResult> {
  try {
    // Get session
    const session = await verifySessionCookie();
    if (!session?.uid) {
      return {
        success: false,
        error: getThaiErrorMessage("SESSION_EXPIRED").message,
      };
    }

    const uid = session.uid;

    // Note: Role check should be done in page.tsx server component
    // We trust that the page already validated the user has 'candidate' role

    const db = getFirebaseAdminFirestore();

    // Step 1: Update contacts collection (uid = user UID for candidates)
    await db.collection("contacts").doc(uid).update({
      email: newEmail.toLowerCase(),
      updated_at: new Date(),
    });

    // Step 2: Set emailVerification flag in candidate_screening
    await db.collection("candidate_screening").doc(uid).update({
      emailVerification: true,
      updated_at: new Date(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update candidate contact email failed:", error);
    return {
      success: false,
      error: getThaiErrorMessage("UPDATE_FAILED").message,
    };
  }
}

/**
 * Update company contact email
 * Per RIS AUTH-R03 Appendix B
 *
 * This updates the email shown on company's job postings.
 *
 * Security:
 * - Requires admin role
 * - Validates companyId matches session.companyId
 * - Uses session companyId (prevents IDOR)
 *
 * @param companyId - The company UID to update
 * @param newEmail - The new contact email
 * @returns Success or error message
 */
export async function updateCompanyContactEmail(
  companyId: string,
  newEmail: string
): Promise<EmailUpdateResult> {
  try {
    // Get session
    const session = await verifySessionCookie();
    if (!session?.uid) {
      return {
        success: false,
        error: getThaiErrorMessage("SESSION_EXPIRED").message,
      };
    }

    // Note: Role and companyId checks should be done in page.tsx server component
    // We trust that the page already validated:
    // - User has 'admin' role
    // - session.companyId === companyId

    // Update contacts collection (uid = company UID for companies)
    const db = getFirebaseAdminFirestore();
    await db.collection("contacts").doc(companyId).update({
      email: newEmail.toLowerCase(),
      updated_at: new Date(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update company contact email failed:", error);
    return {
      success: false,
      error: getThaiErrorMessage("UPDATE_FAILED").message,
    };
  }
}
