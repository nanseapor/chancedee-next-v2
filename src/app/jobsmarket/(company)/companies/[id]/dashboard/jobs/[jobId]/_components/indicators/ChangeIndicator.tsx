"use client";

import { Circle } from 'lucide-react';

interface ChangeIndicatorProps {
  tooltip?: string;
}

export function ChangeIndicator({ tooltip = "มีการเปลี่ยนแปลง" }: ChangeIndicatorProps) {
  return (
    <div
      data-testid="change-indicator"
      className="flex items-center gap-1 text-orange-600"
      title={tooltip}
    >
      <Circle className="h-2 w-2 fill-current" />
      <span className="text-xs">แก้ไขแล้ว</span>
    </div>
  );
}
