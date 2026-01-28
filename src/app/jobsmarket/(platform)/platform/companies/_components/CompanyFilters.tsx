"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminCompanyCounts } from "@/lib/database/actions/admin-companies";
import type { CompanyStatus } from "@/types/jobsmarket/company/status";

/**
 * CompanyFilters component for admin company list
 * Per ADM-R02 Company Management RIS §3.1.1 Filter Bar
 *
 * Filter bar with:
 * - Status tabs (All, Pending, Approved, Rejected, Suspended)
 * - Search input
 * - Status counts in badges
 */

export interface CompanyFiltersProps {
  activeStatus?: CompanyStatus;
  searchQuery: string;
  counts?: AdminCompanyCounts;
  isLoading?: boolean;
  onStatusChange: (status: CompanyStatus | undefined) => void;
  onSearchChange: (query: string) => void;
}

interface StatusTab {
  key: CompanyStatus | undefined;
  label: string;
  countKey: keyof AdminCompanyCounts;
}

const statusTabs: StatusTab[] = [
  { key: undefined, label: "All", countKey: "all" },
  { key: "pending", label: "Pending", countKey: "pending" },
  { key: "approved", label: "Approved", countKey: "approved" },
  { key: "rejected", label: "Rejected", countKey: "rejected" },
  { key: "suspended", label: "Suspended", countKey: "suspended" },
];

function CountBadge({
  count,
  isActive,
}: {
  count: number;
  isActive: boolean;
}) {
  return (
    <span
      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
        isActive
          ? "bg-secondary-100 text-secondary-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {count}
    </span>
  );
}

function SkeletonBadge() {
  return (
    <span
      data-testid="count-skeleton"
      className="ml-2 w-8 h-4 bg-gray-200 rounded-full animate-pulse inline-block"
    />
  );
}

export function CompanyFilters({
  activeStatus,
  searchQuery,
  counts,
  isLoading = false,
  onStatusChange,
  onSearchChange,
}: CompanyFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto" role="tablist">
        {statusTabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          const count = counts?.[tab.countKey];

          return (
            <Button
              key={tab.countKey}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatusChange(tab.key)}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
            >
              {tab.label}
              {isLoading ? (
                <SkeletonBadge />
              ) : counts ? (
                <span data-testid={`count-${tab.countKey}`}>
                  <CountBadge count={count ?? 0} isActive={isActive} />
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          data-testid="search-icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
