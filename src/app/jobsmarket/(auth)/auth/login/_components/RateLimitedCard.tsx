"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RateLimitedCardProps {
  /**
   * Initial countdown in seconds
   * Default: 60 seconds (Firebase default cooldown)
   */
  initialCountdown?: number;
  /**
   * Callback when countdown reaches zero
   */
  onCountdownComplete?: () => void;
  /**
   * Callback for retry button click
   */
  onRetry?: () => void;
}

/**
 * RateLimitedCard - Displayed when user has exceeded rate limit
 * Per AUTH-R01 Implementation Plan §7 (Thai Copy)
 */
export function RateLimitedCard({
  initialCountdown = 60,
  onCountdownComplete,
  onRetry,
}: RateLimitedCardProps) {
  const [countdown, setCountdown] = useState(initialCountdown);

  // Derive canRetry from countdown instead of separate state
  const canRetry = countdown <= 0;

  useEffect(() => {
    if (countdown <= 0) {
      onCountdownComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onCountdownComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} นาที ${secs} วินาที`;
    }
    return `${secs} วินาที`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
          <Clock className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">กรุณารอสักครู่</CardTitle>
        <CardDescription className="mt-2">
          คุณลองเข้าสู่ระบบหลายครั้งเกินไป
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {!canRetry ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              เพื่อความปลอดภัยของบัญชี กรุณารอก่อนลองใหม่
            </p>
            <div className="inline-flex items-center justify-center gap-2 bg-muted rounded-lg px-4 py-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold tabular-nums">
                {formatTime(countdown)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            คุณสามารถลองเข้าสู่ระบบอีกครั้งได้แล้ว
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onRetry}
          className="w-full"
          disabled={!canRetry}
        >
          {canRetry ? "ลองใหม่อีกครั้ง" : "กรุณารอ..."}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RateLimitedCard;
