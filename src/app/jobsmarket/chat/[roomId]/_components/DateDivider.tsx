"use client";

import { format, isToday, isYesterday } from "date-fns";
import { th } from "date-fns/locale";

import type { DateDividerProps } from "@/types/chat.types";

export function DateDivider({ date }: DateDividerProps) {
  const dateObj = typeof date === "number" ? new Date(date) : date;

  const formatDateLabel = (d: Date): string => {
    if (isToday(d)) {
      return "วันนี้";
    }
    if (isYesterday(d)) {
      return "เมื่อวาน";
    }
    return format(d, "d MMMM yyyy", { locale: th });
  };

  return (
    <div
      data-testid="date-divider"
      className="flex items-center justify-center py-4"
    >
      <div className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
        {formatDateLabel(dateObj)}
      </div>
    </div>
  );
}
