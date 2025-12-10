"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ConnectionMonitorProps {
  onConnectionChange?: (status: "connected" | "error" | "loading") => void;
}

export function ConnectionMonitor({
  onConnectionChange,
}: ConnectionMonitorProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "error" | "loading"
  >("loading");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const health = await apiClient.checkHealth();
      const newStatus = health.status === "healthy" ? "connected" : "error";

      setConnectionStatus(newStatus);
      setLastCheck(new Date());
      setRetryCount(0);
      setShowAlert(newStatus === "error");

      if (onConnectionChange) {
        onConnectionChange(newStatus);
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setConnectionStatus("error");
      setShowAlert(true);

      if (onConnectionChange) {
        onConnectionChange("error");
      }
    }
  }, [onConnectionChange]);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      await checkConnection();
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, checkConnection]);

  // Initial connection check
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Periodic health checks
  useEffect(() => {
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network online - checking connection");
      checkConnection();
    };

    const handleOffline = () => {
      console.log("Network offline");
      setConnectionStatus("error");
      setShowAlert(true);
      if (onConnectionChange) {
        onConnectionChange("error");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnection, onConnectionChange]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "error":
        return "Disconnected";
      default:
        return "Connecting...";
    }
  };

  return (
    <div className="space-y-3">
      {/* Connection Status Badge */}
      <Badge
        variant="outline"
        className={`flex items-center gap-2 ${getStatusColor()}`}
      >
        {getStatusIcon()}
        {getStatusText()}
        {lastCheck && (
          <span className="text-xs opacity-75">
            {lastCheck.toLocaleTimeString()}
          </span>
        )}
      </Badge>

      {/* Connection Error Alert */}
      {showAlert && connectionStatus === "error" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Connection lost:</strong> Unable to reach the AI service.
              Some features may not work properly.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isRetrying ? "animate-spin" : ""}`}
              />
              Retry {retryCount > 0 && `(${retryCount})`}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Network Status */}
      {!navigator.onLine && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>No internet connection:</strong> Please check your network
            connection.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Hook for connection monitoring
export function useConnectionMonitor() {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "error" | "loading"
  >("loading");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkConnection = useCallback(async () => {
    if (!isOnline) {
      setConnectionStatus("error");
      return false;
    }

    try {
      const health = await apiClient.checkHealth();
      const connected = health.status === "healthy";
      setConnectionStatus(connected ? "connected" : "error");
      return connected;
    } catch (error) {
      setConnectionStatus("error");
      return false;
    }
  }, [isOnline]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    connectionStatus,
    isOnline,
    checkConnection,
    isConnected: connectionStatus === "connected" && isOnline,
  };
}
