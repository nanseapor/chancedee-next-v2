/**
 * COMP-R00: Company Sidebar Component
 *
 * Desktop sidebar navigation with permission-based filtering
 * Per COMP-R00 implementation plan Phase 3
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CompanySidebar({
  companyId,
  hasPermission,
  badgeCounts,
  isOpen = true,
  onClose,
}: CompanySidebarProps) {
  const pathname = usePathname();
  const navItems = getVisibleNavItems(hasPermission);

  const isActive = (item: NavItem) => {
    const href = buildNavHref(companyId, item);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-200 md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 md:hidden border-b">
          <span className="font-semibold">เมนู</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)] md:h-[calc(100vh-3.5rem)]">
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
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
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
                          ? "bg-primary-foreground/20 text-primary-foreground"
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
    </>
  );
}
