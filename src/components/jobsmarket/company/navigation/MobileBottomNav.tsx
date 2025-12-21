/**
 * COMP-R00: Mobile Bottom Navigation Component
 *
 * Bottom tab bar for mobile navigation
 * Per COMP-R00 implementation plan Phase 3
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
  const navItems = getVisibleNavItems(hasPermission, true); // Mobile only items

  const isActive = (item: NavItem) => {
    const href = buildNavHref(companyId, item);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden safe-area-inset-bottom">
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
                "flex flex-col items-center justify-center flex-1 h-full relative",
                "transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
