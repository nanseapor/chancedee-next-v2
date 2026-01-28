'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RejectionReasonCardProps {
  reason?: string;
  rejectedAt?: Date | number;
  className?: string;
}

const DEFAULT_REASON = 'ข้อมูลบริษัทไม่ครบถ้วนหรือไม่ถูกต้อง กรุณาตรวจสอบและแก้ไขข้อมูล';

export default function RejectionReasonCard({
  reason,
  rejectedAt,
  className,
}: RejectionReasonCardProps) {
  const displayReason = reason || DEFAULT_REASON;

  // Format date if provided
  const formattedDate = rejectedAt
    ? new Date(rejectedAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold">เหตุผลที่ไม่อนุมัติ</h2>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800">ไม่ผ่านการอนุมัติ</AlertTitle>
          <AlertDescription className="text-red-700 mt-2">
            {displayReason}
          </AlertDescription>
        </Alert>

        {formattedDate && (
          <p className="text-xs text-muted-foreground mt-3">
            แจ้งผลเมื่อ {formattedDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
