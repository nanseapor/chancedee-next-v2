/**
 * Firebase Admin Auth Helpers
 *
 * Provides simplified session user retrieval for server actions
 */

import { authenticateSession } from "@/domains/authentication/services/server/actions/auth-engine-actions";

/**
 * Session user info for chat operations
 */
export interface SessionUser {
  uid: string;
  candidateId: string | null;
  companyId: string | null;
}

/**
 * Get the current authenticated session user
 *
 * Returns simplified user info needed for chat operations.
 * Returns null if no valid session exists.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const auth = await authenticateSession({ includeProfile: true });

  if (!auth) {
    return null;
  }

  return {
    uid: auth.user.uid,
    candidateId: auth.user.uid, // For candidates, uid equals candidateId
    companyId: auth.profile?.info?.companyId || null,
  };
}
