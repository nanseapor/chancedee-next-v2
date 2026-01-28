/**
 * Route Guards for Server-Side Authorization
 *
 * These utilities verify authentication and permissions at the layout level,
 * preventing unauthorized access before page components even render.
 *
 * Usage in layouts:
 * - requireAuth() - Any authenticated user
 * - requireCandidateOwner(id) - User must own the candidate profile
 * - requireCompanyMember(id) - User must be a company member
 * - requireAdmin() - User must have admin role
 */

import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";

import { verifySessionCookie } from "@/utils/auth";
import { authenticateSession } from "@/domains/authentication/services/server/actions/auth-engine-actions";
import { fetchUserMembership } from "@/lib/jobsmarket/company/fetchers";
import type { CompanyRole } from "@/types/jobsmarket/company";

/**
 * Require authentication or redirect to login
 * Returns decoded token if authenticated
 */
export async function requireAuth(): Promise<DecodedIdToken> {
  console.log("[AUTH DEBUG] requireAuth called");
  const claims = await verifySessionCookie();

  if (!claims) {
    console.log("[AUTH DEBUG] No valid session - redirecting to login");
    redirect("/auth/login");
  }

  console.log("[AUTH DEBUG] Session valid for uid:", claims.uid);
  return claims;
}

/**
 * Require user to be the candidate owner
 * Redirects to login if not authenticated, 403 if wrong user
 */
export async function requireCandidateOwner(
  candidateId: string
): Promise<DecodedIdToken> {
  const claims = await requireAuth();

  console.log("[AUTH DEBUG] requireCandidateOwner check:", {
    candidateIdFromUrl: candidateId,
    claimsUid: claims.uid,
    match: claims.uid === candidateId,
  });

  if (claims.uid !== candidateId) {
    console.log("[AUTH DEBUG] UID mismatch - redirecting to 403");
    redirect("/403");
  }

  return claims;
}

/**
 * Require user to be a company member
 * Returns membership info including role
 * Redirects to login if not authenticated, 403 if not a member
 */
export async function requireCompanyMember(companyId: string): Promise<{
  claims: DecodedIdToken;
  role: CompanyRole;
}> {
  const claims = await requireAuth();

  const membership = await fetchUserMembership(claims.uid, companyId);

  if (!membership.isMember || !membership.role) {
    redirect("/403");
  }

  return { claims, role: membership.role };
}

/**
 * Require admin role (for platform routes)
 * Checks for "chancedee" role in user profile
 * Redirects to login if not authenticated, 403 if not admin
 */
export async function requireAdmin(): Promise<DecodedIdToken> {
  const auth = await authenticateSession({ includeProfile: true });

  if (!auth) {
    redirect("/auth/login");
  }

  const roles = auth.profile?.info?.roles || [];
  if (!roles.includes("chancedee")) {
    redirect("/403");
  }

  return auth.user;
}

/**
 * Optional auth check - returns claims if authenticated, null if not
 * Use this when auth is optional but you want to show different content
 */
export async function optionalAuth(): Promise<DecodedIdToken | null> {
  return await verifySessionCookie();
}
