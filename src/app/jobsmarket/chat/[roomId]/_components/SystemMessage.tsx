"use client";

import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Info } from "lucide-react";

import type { SystemMessageProps } from "@/types/chat.types";

export function SystemMessage({ message, timestamp, type }: SystemMessageProps) {
  const formattedTime = format(new Date(timestamp), "HH:mm", { locale: th });

  return (
    <div
      data-testid="system-message"
      className="flex items-center justify-center gap-2 py-3"
    >
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg">
        <Info className="h-4 w-4 shrink-0" />
        <span>{message}</span>
        <span className="text-xs opacity-70">{formattedTime}</span>
      </div>
    </div>
  );
}
