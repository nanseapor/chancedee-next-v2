"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TabId } from "./SettingsClient";

interface SettingsTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isPending: boolean;
}

export function SettingsTabs({ activeTab, onTabChange, isPending }: SettingsTabsProps) {
  const tabs = [
    { id: "account" as TabId, label: "บัญชี", englishLabel: "Account", visible: true },
    { id: "password" as TabId, label: "รหัสผ่าน", englishLabel: "Password", visible: true },
    { id: "notifications" as TabId, label: "การแจ้งเตือน", englishLabel: "Notifications", visible: !isPending },
    { id: "privacy" as TabId, label: "ความเป็นส่วนตัว", englishLabel: "Privacy", visible: true },
    { id: "delete" as TabId, label: "ลบบัญชี", englishLabel: "Delete Account", visible: true },
  ];

  const visibleTabs = tabs.filter(tab => tab.visible);

  return (
    <div className="flex border-b overflow-x-auto">
      {visibleTabs.map(tab => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "shrink-0 px-4 py-3 h-auto text-sm font-medium rounded-none border-b-2",
            activeTab === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted hover:bg-transparent"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span>{tab.label}</span>
            <span className="text-xs">{tab.englishLabel}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}
