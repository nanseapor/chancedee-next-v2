/**
 * COMP-R00: Company Sidebar Component
 *
 * Desktop-only sidebar navigation with permission-based filtering
 * Mobile navigation is handled by MobileNavbar in CompanyHeader + MobileBottomNav
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  NavItem,
  NavBadgeCounts,
  Permission,
} from "@/types/jobsmarket/company";
import {
  getVisibleNavItems,
  buildNavHref,
} from "@/lib/jobsmarket/company/navigation";

interface CompanySidebarProps {
  companyId: string;
  hasPermission: (permission: Permission) => boolean;
  badgeCounts?: NavBadgeCounts;
}

export default function CompanySidebar({
  companyId,
  hasPermission,
  badgeCounts,
}: CompanySidebarProps) {
  const pathname = usePathname();
  const navItems = getVisibleNavItems(hasPermission);

  const isActive = (item: NavItem) => {
    const href = buildNavHref(companyId, item);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="w-64 bg-background border-r min-h-[calc(100vh-3.5rem)]">
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <nav className="p-4 space-y-1">
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
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary-100 text-secondary-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span
                    className={cn(
                      "ml-auto px-2 py-0.5 text-xs rounded-full",
                      active
                        ? "bg-secondary-200 text-secondary-800"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    )}
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
