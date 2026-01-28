/**
 * Company Team Management Types
 * Extracted from company-team.ts for Next.js 15+ compatibility
 */

export interface TeamActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface PendingEmployee {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  requestTimestamp: number;
  isExpired: boolean;
}
