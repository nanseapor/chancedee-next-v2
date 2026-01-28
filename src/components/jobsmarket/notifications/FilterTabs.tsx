"use client";

/**
 * FilterTabs Component - NOTIF-R01
 *
 * Horizontal scrollable filter tabs for notification categories.
 */

import { useCallback } from "react";

import { cn } from "@/lib/utils";
import type { NotificationFilterCategory, FilterTabsProps } from "@/types/notification.types";

interface FilterTabConfig {
  id: NotificationFilterCategory;
  label: string;
}

const FILTER_TABS: FilterTabConfig[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "applications", label: "สมัครงาน" },
  { id: "messages", label: "ข้อความ" },
  { id: "appointments", label: "นัดหมาย" },
  { id: "system", label: "ระบบ" },
];

export function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
  disabled = false,
}: FilterTabsProps) {
  const handleTabClick = useCallback(
    (filter: NotificationFilterCategory) => {
      if (!disabled) {
        onFilterChange(filter);
      }
    },
    [disabled, onFilterChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, filter: NotificationFilterCategory) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTabClick(filter);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = FILTER_TABS.findIndex((tab) => tab.id === filter);
        let nextIndex: number;

        if (e.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % FILTER_TABS.length;
        } else {
          nextIndex = (currentIndex - 1 + FILTER_TABS.length) % FILTER_TABS.length;
        }

        // Focus the next tab
        const nextTab = document.querySelector(
          `[data-tab-id="${FILTER_TABS[nextIndex]?.id}"]`
        ) as HTMLElement;
        nextTab?.focus();
      }
    },
    [handleTabClick]
  );

  const getBadgeCount = (tabId: NotificationFilterCategory): number | undefined => {
    if (!counts) return undefined;

    switch (tabId) {
      case "applications":
        return counts.applications;
      case "appointments":
        return counts.appointments;
      case "system":
        return counts.system;
      default:
        return undefined;
    }
  };

  const formatBadgeCount = (count: number): string => {
    return count > 99 ? "99+" : count.toString();
  };

  return (
    <div
      role="tablist"
      aria-label="ตัวกรองการแจ้งเตือน"
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.id;
        const badgeCount = getBadgeCount(tab.id);
        const showBadge = badgeCount !== undefined && badgeCount > 0;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            data-tab-id={tab.id}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={cn(
              "relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2",
              isActive
                ? "bg-secondary-100 text-secondary-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span>{tab.label}</span>

            {showBadge && (
              <span
                data-testid={`filter-badge-${tab.id}`}
                className={cn(
                  "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium rounded-full",
                  isActive
                    ? "bg-secondary-500 text-white"
                    : "bg-gray-300 text-gray-700"
                )}
              >
                {formatBadgeCount(badgeCount)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
