"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Settings } from "lucide-react";

// ============================================
// Types
// ============================================

export type SettingsTabValue = "profile" | "config";

interface SettingsTabsProps {
  activeTab: SettingsTabValue;
  onTabChange: (tab: SettingsTabValue) => void;
  canEdit: boolean;
}

// ============================================
// Tab Definitions
// ============================================

const tabs = [
  {
    value: "profile" as const,
    labelTh: "โปรไฟล์บริษัท",
    labelEn: "Profile",
    icon: Building2,
  },
  {
    value: "config" as const,
    labelTh: "การตั้งค่า",
    labelEn: "Configuration",
    icon: Settings,
  },
];

// ============================================
// Component
// ============================================

export function SettingsTabs({
  activeTab,
  onTabChange,
  canEdit,
}: SettingsTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as SettingsTabValue)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2"
            disabled={!canEdit && tab.value === "config"}
          >
            <tab.icon className="h-4 w-4" />
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">{tab.labelTh}</span>
              <span className="text-xs text-gray-500">{tab.labelEn}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
