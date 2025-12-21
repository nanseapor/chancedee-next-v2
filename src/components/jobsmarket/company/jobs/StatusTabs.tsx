import type { StatusCounts } from "@/types/jobsmarket/jobs-list.types";

type TabStatus = "all" | "active" | "draft" | "paused" | "closed";

interface StatusTabsProps {
  activeStatus: TabStatus;
  counts: StatusCounts;
  onTabChange: (status: TabStatus) => void;
  isLoading: boolean;
}

export function StatusTabs({
  activeStatus,
  counts,
  onTabChange,
  isLoading,
}: StatusTabsProps) {
  const tabs = [
    { value: "all" as const, label: "ทั้งหมด", count: counts.total },
    { value: "active" as const, label: "กำลังเปิดรับ", count: counts.active },
    { value: "draft" as const, label: "ร่าง", count: counts.draft },
    { value: "paused" as const, label: "หยุดชั่วคราว", count: counts.paused },
    { value: "closed" as const, label: "ปิดแล้ว", count: counts.closed },
  ];

  return (
    <div role="tablist" className="flex gap-2 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            disabled={isLoading}
            onClick={() => onTabChange(tab.value)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-secondary-600 text-secondary-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            } disabled:opacity-50`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
