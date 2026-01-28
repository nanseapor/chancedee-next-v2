"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONTEXT_MESSAGES, type ContextFromType } from "@/store/jobsmarket/auth-atoms";

interface ContextMessageProps {
  type: ContextFromType;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/**
 * ContextMessage - Displays context message for SHOW_MESSAGE state
 * Per AUTH-R01 Implementation Plan §6
 */
export function ContextMessage({
  type,
  onDismiss,
  autoDismissMs = 5000,
}: ContextMessageProps) {
  const [countdown, setCountdown] = useState(Math.floor(autoDismissMs / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss, autoDismissMs]);

  const message = CONTEXT_MESSAGES[type];
  const { icon: Icon, bgColor, borderColor, iconColor } = getMessageStyle(type);

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 mb-4",
        bgColor,
        borderColor
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColor)} />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ข้อความนี้จะหายไปใน {countdown} วินาที
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          aria-label="ปิดข้อความ"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getMessageStyle(type: ContextFromType): {
  icon: typeof Info;
  bgColor: string;
  borderColor: string;
  iconColor: string;
} {
  switch (type) {
    case "session-expired":
      return {
        icon: AlertCircle,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-600",
      };
    case "registration":
      return {
        icon: CheckCircle,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        iconColor: "text-green-600",
      };
    case "password-reset":
      return {
        icon: CheckCircle,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        iconColor: "text-green-600",
      };
    case "protected":
    default:
      return {
        icon: Info,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-600",
      };
  }
}

export default ContextMessage;
