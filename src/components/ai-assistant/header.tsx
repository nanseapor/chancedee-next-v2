"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageCircle, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  apiStatus?: "loading" | "connected" | "error";
}

export function Header({ apiStatus = "connected" }: HeaderProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Wifi className="h-3 w-3" />;
      case "error":
        return <WifiOff className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "error":
        return "Offline";
      default:
        return "Connecting";
    }
  };

  return (
    <header className="border-b bg-background px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-kanit text-xl font-semibold text-foreground">
            AI Assistant
          </h1>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 text-xs ${getStatusColor(apiStatus)}`}
          >
            {getStatusIcon(apiStatus)}
            {getStatusText(apiStatus)}
          </Badge>
        </div>
      </div>
    </header>
  );
}
