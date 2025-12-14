import type { userDataProps } from "@/types/auth.types";

/**
 * Status types for the /auth/status page
 * Per AUTH-R05 RIS §4
 */
export type StatusType = "deleted" | "staff-pending" | "company-pending" | "rejected";

/**
 * Detects user status type from user data with priority ordering
 * Per AUTH-R05 RIS §4.1 - Priority: deleted > company-pending > staff-pending
 *
 * @param user - User data from Firestore
 * @returns StatusType if user has a status to display, null if user should be redirected to dashboard
 */
export function detectStatusType(user: userDataProps | null | undefined): StatusType | null {
  if (!user) {
    return null;
  }

  const roles = user.info?.roles || [];
  const status = user.status;
  const isActive = user.isActive;
  const targetCompany = user.transfer?.targetCompany;

  // Priority 1: Deleted status (highest priority)
  // Check both roles array and status/is_active fields
  if (
    roles.includes("deleted") ||
    (status === "deleted" && isActive === false)
  ) {
    return "deleted";
  }

  // Priority 2: Company-pending (admin waiting for platform approval)
  // User has 'pending' role, 'admin' role, and target_company
  if (
    roles.includes("pending") &&
    roles.includes("admin") &&
    targetCompany
  ) {
    return "company-pending";
  }

  // Priority 3: Staff-pending (staff waiting for company approval)
  // User has 'pending' role, target_company, but NOT 'admin' role
  if (
    roles.includes("pending") &&
    targetCompany &&
    !roles.includes("admin")
  ) {
    return "staff-pending";
  }

  // No status found - user should be redirected to dashboard
  return null;
}

/**
 * Validates if the provided query parameter status type matches the detected status
 * Per AUTH-R05 RIS §4.2 - If ?type param doesn't match detected status, silently ignore and use detected
 *
 * @param queryType - Status type from ?type query parameter
 * @param detectedType - Status type detected from user data
 * @returns The validated status type to use
 */
export function validateStatusType(
  queryType: string | null | undefined,
  detectedType: StatusType | null
): StatusType | "rejected" | null {
  // Special case: ?type=rejected always shows rejected view (no user data needed)
  // This is for users navigating back from company rejection
  if (queryType === "rejected") {
    return "rejected";
  }

  // If no detected type, return null (redirect to dashboard)
  if (!detectedType) {
    return null;
  }

  // If query type matches detected type, use it
  if (queryType === detectedType) {
    return detectedType;
  }

  // Query type doesn't match or is not provided - use detected type
  return detectedType;
}

/**
 * Gets the target company ID from user data
 * Per AUTH-R05 RIS §5.2 - Company name is shown in pending views
 *
 * @param user - User data from Firestore
 * @returns Company ID from transfer.targetCompany, or null if not found
 */
export function getTargetCompanyId(user: userDataProps | null | undefined): string | null {
  if (!user?.transfer?.targetCompany) {
    return null;
  }
  return user.transfer.targetCompany;
}
