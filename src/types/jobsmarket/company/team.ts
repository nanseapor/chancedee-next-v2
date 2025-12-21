/**
 * COMP-R00: Team Member Types
 *
 * Defines team members and invitations
 */

import type { CompanyRole } from "./roles";
import type { MembershipStatus } from "./status";

/**
 * Team member (user with company access)
 */
export interface TeamMember {
  uid: string;

  /** User's display name */
  displayName: string;

  /** User's email */
  email: string;

  /** User's avatar URL */
  avatarUrl?: string;

  /** Role in this company */
  role: CompanyRole;

  /** Membership status */
  status: MembershipStatus;

  /** When they joined */
  joinedAt: number;

  /** Who invited them */
  invitedBy?: string;

  /** Last active timestamp */
  lastActiveAt?: number;
}

/**
 * Pending invitation to join company
 */
export interface PendingInvitation {
  uid: string;

  /** Email of invitee */
  email: string;

  /** Assigned role */
  role: CompanyRole;

  /** Who sent the invitation */
  invitedBy: string;

  /** When invitation was sent */
  invitedAt: number;

  /** Expiration timestamp */
  expiresAt: number;

  /** Whether invitation is still valid */
  isValid: boolean;
}
