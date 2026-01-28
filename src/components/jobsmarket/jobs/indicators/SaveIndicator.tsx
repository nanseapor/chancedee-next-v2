"use client";

import { Loader2, Check, AlertCircle } from "lucide-react";

export interface SaveIndicatorProps {
  status: "idle" | "dirty" | "saving" | "saved" | "error";
  lastSaved?: Date;
  error?: string;
}

/**
 * Save status indicator component
 * Displays current auto-save state with appropriate visual feedback
 */
export function SaveIndicator({ status, lastSaved, error }: SaveIndicatorProps) {
  // Idle state - nothing to show
  if (status === "idle") {
    return null;
  }

  // Format time as HH:MM
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {status === "dirty" && (
        <>
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-gray-600">มีการเปลี่ยนแปลง</span>
        </>
      )}

      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-secondary-600" />
          <span className="text-gray-600">กำลังบันทึก...</span>
        </>
      )}

      {status === "saved" && lastSaved && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">
            บันทึกแล้ว {formatTime(lastSaved)}
          </span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600">
            {error || "บันทึกไม่สำเร็จ"}
          </span>
        </>
      )}
    </div>
  );
}
