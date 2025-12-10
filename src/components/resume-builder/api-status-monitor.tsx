"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api-client";
import { SessionManager } from "@/lib/session-manager";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  Server,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ApiStatusMonitorProps {
  apiStatus: "loading" | "connected" | "error";
  onRefresh?: () => Promise<void>;
}

export function ApiStatusMonitor({
  apiStatus,
  onRefresh,
}: ApiStatusMonitorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [apiHealth, setApiHealth] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [storageQuota, setStorageQuota] = useState<any>(null);

  useEffect(() => {
    checkAllStatus();
  }, []);

  const checkAllStatus = async () => {
    setIsRefreshing(true);
    try {
      // Check API health
      const health = await apiClient.checkHealth();
      setApiHealth(health);

      // Check storage stats
      const stats = await getStorageStats();
      setStorageStats(stats);

      // Check storage quota
      const quota = await SessionManager.getStorageQuota();
      setStorageQuota(quota);

      setLastCheck(new Date());
    } catch (error) {
      console.error("Status check failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStorageStats = async () => {
    try {
      const testResult = SessionManager.testStorage();
      return {
        available: testResult.available,
        testSize: testResult.testSize,
        error: testResult.error,
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
    await checkAllStatus();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              API connection and storage monitoring
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">API Connection</span>
            </div>
            <Badge variant="outline" className={getStatusColor(apiStatus)}>
              {getStatusIcon(apiStatus)}
              {apiStatus === "connected"
                ? "Connected"
                : apiStatus === "error"
                  ? "Offline"
                  : "Connecting"}
            </Badge>
          </div>

          {apiHealth && (
            <div className="pl-6 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Model:</span>
                <span>{apiHealth.model || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <span>{apiHealth.platform || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span>Configuration:</span>
                <span>
                  {apiHealth.configuration?.configurationCentralized
                    ? "Centralized"
                    : "Legacy"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Storage Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Local Storage</span>
            </div>
            <Badge
              variant="outline"
              className={
                storageStats?.available
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }
            >
              {storageStats?.available ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Available
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unavailable
                </>
              )}
            </Badge>
          </div>

          {storageStats && (
            <div className="pl-6 space-y-2 text-sm text-muted-foreground">
              {storageStats.available ? (
                <div className="flex justify-between">
                  <span>Test Size:</span>
                  <span>{formatBytes(storageStats.testSize || 0)}</span>
                </div>
              ) : (
                <div className="text-red-600">Error: {storageStats.error}</div>
              )}
            </div>
          )}

          {storageQuota && (
            <div className="pl-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Quota:</span>
                <span>{formatBytes(storageQuota.quota)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Usage:</span>
                <span>{formatBytes(storageQuota.usage)}</span>
              </div>
              <Progress value={storageQuota.usagePercent} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {storageQuota.usagePercent}% used
              </div>
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Session</span>
          </div>

          <div className="pl-6 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Version:</span>
              <span>4.3.0-centralized</span>
            </div>
            <div className="flex justify-between">
              <span>Approach:</span>
              <span>Client-controlled</span>
            </div>
            {lastCheck && (
              <div className="flex justify-between">
                <span>Last Check:</span>
                <span>{lastCheck.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
