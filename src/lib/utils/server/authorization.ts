/**
 * Authorization Utilities
 *
 * Centralized authorization checks to prevent IDOR vulnerabilities.
 * These utilities ensure users can only access resources they own or have permission to view.
 */

import type { AuthResult } from "@/types/auth.types";
import { NextResponse } from "next/server";

/**
 * Check if user can access a specific user's data
 *
 * Rules:
 * - Users can access their own data
 * - Admins (chancedee role) can access any user's data
 * - All others are forbidden
 *
 * @param auth - Authenticated user session
 * @param targetUid - UID of the user data being accessed
 * @returns true if authorized, false otherwise
 */
export const canAccessUserData = (
  auth: AuthResult,
  targetUid: string,
): boolean => {
  // User accessing their own data
  if (auth.user.uid === targetUid) {
    return true;
  }

  // Check if user is admin (chancedee role)
  const isAdmin = auth.profile?.info?.roles?.includes("chancedee");
  if (isAdmin) {
    return true;
  }

  return false;
};

/**
 * Check if user can access candidate profile data
 *
 * Rules:
 * - Candidate can access their own profile
 * - Admins can access any candidate profile
 * - Companies can access candidates who applied to their jobs (future enhancement)
 *
 * @param auth - Authenticated user session
 * @param targetCandidateUid - UID of the candidate being accessed
 * @returns true if authorized, false otherwise
 */
export const canAccessCandidateData = (
  auth: AuthResult,
  targetCandidateUid: string,
): boolean => {
  // Candidate accessing their own data
  if (auth.user.uid === targetCandidateUid) {
    return true;
  }

  // Admin can access any candidate
  const isAdmin = auth.profile?.info?.roles?.includes("chancedee");
  if (isAdmin) {
    return true;
  }

  // TODO: Add company access for candidates who applied to their jobs
  // const isCompany = auth.profile?.info?.roles?.includes('company');
  // if (isCompany) {
  //   return await hasCandidateAppliedToCompany(targetCandidateUid, auth.profile.info.companyId);
  // }

  return false;
};

/**
 * Check if user can access interview data
 *
 * Rules:
 * - Candidate can access interviews where they are the candidate
 * - Company can access interviews for their jobs
 * - Admins can access all interviews
 *
 * @param auth - Authenticated user session
 * @param interviewData - Interview data with candidateId and companyId
 * @returns true if authorized, false otherwise
 */
export const canAccessInterviewData = (
  auth: AuthResult,
  interviewData: { candidateId?: string; companyId?: string },
): boolean => {
  // Admin can access any interview
  const isAdmin = auth.profile?.info?.roles?.includes("chancedee");
  if (isAdmin) {
    return true;
  }

  // Candidate accessing their own interview
  if (interviewData.candidateId === auth.user.uid) {
    return true;
  }

  // Company accessing their own company's interview
  const userCompanyId = auth.profile?.info?.companyId;
  if (userCompanyId && interviewData.companyId === userCompanyId) {
    return true;
  }

  return false;
};

/**
 * Check if user can access job data
 *
 * Rules:
 * - Anyone can view published jobs (public)
 * - Company can view their own jobs (draft/unpublished)
 * - Admins can view all jobs
 *
 * @param auth - Authenticated user session
 * @param jobData - Job data with companyId and status
 * @returns true if authorized, false otherwise
 */
export const canAccessJobData = (
  auth: AuthResult,
  jobData: { companyId?: string; status?: string },
): boolean => {
  // Admin can access any job
  const isAdmin = auth.profile?.info?.roles?.includes("chancedee");
  if (isAdmin) {
    return true;
  }

  // Published jobs are public - anyone can view
  if (jobData.status === "published" || jobData.status === "active") {
    return true;
  }

  // Company accessing their own job (including drafts)
  const userCompanyId = auth.profile?.info?.companyId;
  if (userCompanyId && jobData.companyId === userCompanyId) {
    return true;
  }

  return false;
};

/**
 * Return 403 Forbidden response
 *
 * Standard response for authorization failures
 */
export const forbiddenResponse = (
  message = "Forbidden - You do not have permission to access this resource",
) => {
  return NextResponse.json({ error: message }, { status: 403 });
};

/**
 * Check authorization and return error response if unauthorized
 *
 * Utility function to simplify authorization checks in API routes
 *
 * @param isAuthorized - Result of authorization check
 * @param errorMessage - Custom error message
 * @returns null if authorized, NextResponse if unauthorized
 */
export const checkAuthorization = (
  isAuthorized: boolean,
  errorMessage?: string,
): NextResponse | null => {
  if (!isAuthorized) {
    return forbiddenResponse(errorMessage);
  }
  return null;
};
