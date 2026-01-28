"use client";

import { Wifi, WifiOff, Loader2, AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConnectionBannerProps, ConnectionStatus } from "@/types/chat.types";

const statusConfig: Record<
  ConnectionStatus,
  {
    message: string;
    icon: typeof Wifi;
    className: string;
    showRetry: boolean;
  }
> = {
  connected: {
    message: "เชื่อมต่อแล้ว",
    icon: Wifi,
    className: "bg-green-100 text-green-700 border-green-200",
    showRetry: false,
  },
  connecting: {
    message: "กำลังเชื่อมต่อ...",
    icon: Loader2,
    className: "bg-blue-100 text-blue-700 border-blue-200",
    showRetry: false,
  },
  reconnecting: {
    message: "กำลังเชื่อมต่อใหม่...",
    icon: Loader2,
    className: "bg-amber-100 text-amber-700 border-amber-200",
    showRetry: false,
  },
  offline: {
    message: "ออฟไลน์ - ไม่มีการเชื่อมต่อ",
    icon: WifiOff,
    className: "bg-gray-100 text-gray-700 border-gray-200",
    showRetry: true,
  },
  error: {
    message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
    icon: AlertCircle,
    className: "bg-red-100 text-red-700 border-red-200",
    showRetry: true,
  },
};

export function ConnectionBanner({ status, onRetry }: ConnectionBannerProps) {
  // Don't show banner when connected (unless just connected)
  if (status === "connected") {
    return null;
  }

  const config = statusConfig[status];
  const Icon = config.icon;
  const isSpinning = status === "connecting" || status === "reconnecting";

  return (
    <div
      data-testid="connection-banner"
      className={cn(
        "flex items-center justify-center gap-2 py-2 px-4 text-sm border-b",
        config.className
      )}
    >
      <Icon
        data-testid="connection-icon"
        className={cn("h-4 w-4", isSpinning && "animate-spin")}
      />
      <span data-testid="connection-message">{config.message}</span>
      {config.showRetry && onRetry && (
        <Button
          data-testid="retry-connection-button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onRetry}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          ลองใหม่
        </Button>
      )}
    </div>
  );
}
