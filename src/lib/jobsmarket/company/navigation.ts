/**
 * COMP-R00: Navigation Configuration
 *
 * Defines navigation structure for company routes
 * Per COMP-R00 implementation plan Phase 3
 */

import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";
import type { NavItem, Permission } from "@/types/jobsmarket/company";

/**
 * Main navigation items for company shell
 * Order determines display order
 */
export const COMPANY_NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "แดชบอร์ด",
    href: "/dashboard",
    icon: LayoutDashboard,
    showOnMobile: true,
    order: 1,
  },
  {
    key: "jobs",
    label: "งานที่ประกาศ",
    href: "/jobs",
    icon: Briefcase,
    badgeKey: "jobs",
    showOnMobile: true,
    order: 2,
  },
  {
    key: "applications",
    label: "ใบสมัคร",
    href: "/applications",
    icon: FileText,
    badgeKey: "applications",
    requiredPermission: "view_applications",
    showOnMobile: true,
    order: 3,
  },
  {
    key: "chat",
    label: "ข้อความ",
    href: "/chat",
    icon: MessageSquare,
    showOnMobile: true,
    order: 4,
    absoluteHref: true,
  },
  {
    key: "team",
    label: "ทีมงาน",
    href: "/team",
    icon: Users,
    badgeKey: "team",
    requiredPermission: "manage_team",
    showOnMobile: false,
    order: 5,
  },
  {
    key: "settings",
    label: "ตั้งค่า",
    href: "/settings",
    icon: Settings,
    requiredPermission: "company_settings",
    showOnMobile: false,
    order: 6,
  },
];

/**
 * Get visible nav items based on user's permissions
 */
export function getVisibleNavItems(
  hasPermission: (permission: Permission) => boolean,
  mobileOnly: boolean = false
): NavItem[] {
  return COMPANY_NAV_ITEMS.filter((item) => {
    // Check permission if required
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false;
    }
    // Filter for mobile if requested
    if (mobileOnly && !item.showOnMobile) {
      return false;
    }
    return true;
  }).sort((a, b) => a.order - b.order);
}

/**
 * Build full href with company ID
 */
export function buildNavHref(companyId: string, navItem: NavItem): string {
  if (navItem.absoluteHref) {
    return navItem.href;
  }
  return `/jobsmarket/companies/${companyId}${navItem.href}`;
}
