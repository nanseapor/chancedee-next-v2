"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, Briefcase, Settings } from "lucide-react";

import { useAdminStats } from "@/hooks/jobsmarket/admin/use-admin-stats";
import { cn } from "@/lib/utils";

/**
 * Admin Sidebar Component
 * Per ADM-R00 Cross-Cutting RIS §2.2 Sidebar Specification
 *
 * Fixed sidebar with:
 * - Logo/branding at top
 * - Navigation items with pending count badges
 * - Settings at bottom
 *
 * Width: 280px
 */

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "pendingCompanies" | "pendingCandidates" | "pendingJobs";
}

const navItems: NavItem[] = [
  {
    id: "companies",
    label: "Companies",
    href: "/platform/companies",
    icon: Building2,
    badgeKey: "pendingCompanies",
  },
  {
    id: "candidates",
    label: "Candidates",
    href: "/platform/candidates",
    icon: Users,
    badgeKey: "pendingCandidates",
  },
  {
    id: "jobs",
    label: "Jobs",
    href: "/platform/jobs",
    icon: Briefcase,
    badgeKey: "pendingJobs",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/platform/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { pendingCompanies, pendingCandidates, pendingJobs, isLoading } =
    useAdminStats();

  const badgeCounts = {
    pendingCompanies,
    pendingCandidates,
    pendingJobs,
  };

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <aside
      data-testid="admin-sidebar"
      className="flex h-full w-[280px] flex-col border-r border-gray-200 bg-white"
    >
      {/* Logo and Branding */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div
          data-testid="admin-logo"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white"
        >
          <span className="text-sm font-bold">CD</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">ChanceDee</span>
          <span className="text-xs text-gray-500">Platform Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="mb-2 px-3">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            MANAGEMENT
          </span>
        </div>

        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  data-testid={`nav-${item.id}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-purple-600" : "text-gray-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {/* Badge */}
                  {isLoading ? (
                    <div
                      data-testid="badge-skeleton"
                      className="h-5 w-8 animate-pulse rounded-full bg-gray-200"
                    />
                  ) : badgeCount > 0 ? (
                    <span
                      data-testid={`${item.id}-badge`}
                      className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-purple-100 px-1.5 text-xs font-medium text-purple-700"
                    >
                      {badgeCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-center text-xs text-gray-400">
          ChanceDee Admin v1.0
        </p>
      </div>
    </aside>
  );
}
