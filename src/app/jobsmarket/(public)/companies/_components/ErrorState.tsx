"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

/**
 * ErrorState - Shown when company fetch fails
 *
 * @specification COMP-R09 Company Directory
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12 px-4" data-testid="companies-error-state">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        เกิดข้อผิดพลาด
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
      <Button onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        ลองใหม่อีกครั้ง
      </Button>
    </div>
  );
}
