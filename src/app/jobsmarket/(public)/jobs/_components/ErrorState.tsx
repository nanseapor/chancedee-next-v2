'use client';

import { AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface ErrorStateProps {
  error: string;
  isFallback?: boolean; // True if using Firestore fallback
  onRetry?: () => void;
}

export function ErrorState({ error, isFallback, onRetry }: ErrorStateProps) {
  // Fallback notice (not an error, just informational)
  if (isFallback) {
    return (
      <Alert variant="default" className="mb-4">
        <Wifi size={16} />
        <AlertTitle>กำลังใช้ข้อมูลสำรอง</AlertTitle>
        <AlertDescription>
          ระบบค้นหาหลักไม่พร้อมใช้งานชั่วคราว ผลลัพธ์อาจไม่สมบูรณ์
        </AlertDescription>
      </Alert>
    );
  }

  // Actual error
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle size={48} className="text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        เกิดข้อผิดพลาด
      </h3>
      <p className="text-muted-foreground mb-4">
        {error || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw size={16} className="mr-2" />
          ลองใหม่
        </Button>
      )}
    </div>
  );
}
