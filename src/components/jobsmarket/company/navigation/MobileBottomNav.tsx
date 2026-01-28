/**
 * COMP-R00: Mobile Bottom Navigation Component
 *
 * Bottom tab bar for mobile navigation
 * Aligned with CandidateShell bottom nav styling
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  NavItem,
  NavBadgeCounts,
  Permission,
} from "@/types/jobsmarket/company";
import {
  getVisibleNavItems,
  buildNavHref,
} from "@/lib/jobsmarket/company/navigation";

interface MobileBottomNavProps {
  companyId: string;
  hasPermission: (permission: Permission) => boolean;
  badgeCounts?: NavBadgeCounts;
}

export default function MobileBottomNav({
  companyId,
  hasPermission,
  badgeCounts,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const navItems = getVisibleNavItems(hasPermission, true);

  const isActive = (item: NavItem) => {
    const href = buildNavHref(companyId, item);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href = buildNavHref(companyId, item);
          const active = isActive(item);
          const badgeCount = item.badgeKey
            ? badgeCounts?.[item.badgeKey]
            : undefined;

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                active ? "text-secondary-600" : "text-gray-400"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
