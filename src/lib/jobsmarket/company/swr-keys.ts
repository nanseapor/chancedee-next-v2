/**
 * COMP-R00: SWR Key Factory
 *
 * Ensures consistent cache keys across the application
 * Per COMP-R00 implementation plan Phase 2
 */

const PREFIX = "company";

/**
 * Generate SWR key for company profile
 */
export function getCompanyProfileKey(
  companyId: string | null | undefined
): string | null {
  if (!companyId) return null;
  return `${PREFIX}:profile:${companyId}`;
}

/**
 * Generate SWR key for company membership check
 */
export function getCompanyMembershipKey(
  userId: string | null | undefined,
  companyId: string | null | undefined
): string | null {
  if (!userId || !companyId) return null;
  return `${PREFIX}:membership:${userId}:${companyId}`;
}

/**
 * Generate SWR key for team members list
 */
export function getCompanyTeamKey(
  companyId: string | null | undefined
): string | null {
  if (!companyId) return null;
  return `${PREFIX}:team:${companyId}`;
}

/**
 * Generate SWR key for company jobs list
 */
export function getCompanyJobsKey(
  companyId: string | null | undefined
): string | null {
  if (!companyId) return null;
  return `${PREFIX}:jobs:${companyId}`;
}

/**
 * Generate SWR key for company applications
 */
export function getCompanyApplicationsKey(
  companyId: string | null | undefined
): string | null {
  if (!companyId) return null;
  return `${PREFIX}:applications:${companyId}`;
}

/**
 * Generate SWR key for badge counts
 */
export function getCompanyBadgeCountsKey(
  companyId: string | null | undefined
): string | null {
  if (!companyId) return null;
  return `${PREFIX}:badges:${companyId}`;
}

/**
 * Centralized SWR key factory
 */
export const companySwrKeys = {
  profile: getCompanyProfileKey,
  membership: getCompanyMembershipKey,
  team: getCompanyTeamKey,
  jobs: getCompanyJobsKey,
  applications: getCompanyApplicationsKey,
  badgeCounts: getCompanyBadgeCountsKey,
} as const;
