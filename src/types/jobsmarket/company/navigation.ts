/**
 * COMP-R00: Navigation Types
 *
 * Defines navigation items and shell types for company routes
 */

import type { Permission } from "./roles";
import type { LucideIcon } from "lucide-react";

/**
 * Navigation item in company shell
 */
export interface NavItem {
  /** Unique key */
  key: string;

  /** Display label (Thai) */
  label: string;

  /** Route path (relative to /jobsmarket/companies/[id]) */
  href: string;

  /** Icon component */
  icon: LucideIcon;

  /** Required permission to see this item */
  requiredPermission?: Permission;

  /** Badge count key (for dynamic badges) */
  badgeKey?: "jobs" | "applications" | "team";

  /** Whether to show on mobile bottom nav */
  showOnMobile: boolean;

  /** Order in navigation (lower = higher) */
  order: number;

  /** If true, href is absolute (not prefixed with company path) */
  absoluteHref?: boolean;
}

/**
 * Shell type to use
 */
export type ShellType = "company" | "minimal";

/**
 * Badge counts for navigation
 */
export interface NavBadgeCounts {
  jobs?: number;
  applications?: number;
  team?: number;
}
