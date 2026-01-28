'use client';

import { XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import RejectionReasonCard from './RejectionReasonCard';
import RejectedActions from './RejectedActions';

interface RejectedStatusCardProps {
  companyId: string;
  companyName?: string;
  rejectionReason?: string;
  rejectedAt?: Date | number;
}

export default function RejectedStatusCard({
  companyId,
  companyName,
  rejectionReason,
  rejectedAt,
}: RejectedStatusCardProps) {
  return (
    <div className="max-w-2xl w-full mx-auto space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-700">ไม่ผ่านการอนุมัติ</h1>
          {companyName && (
            <p className="text-muted-foreground">{companyName}</p>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            ขออภัย บริษัทของคุณไม่ผ่านการอนุมัติในครั้งนี้
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            กรุณาตรวจสอบเหตุผลด้านล่างและดำเนินการแก้ไข
          </p>
        </CardContent>
      </Card>

      {/* Rejection Reason */}
      <RejectionReasonCard
        reason={rejectionReason}
        rejectedAt={rejectedAt}
      />

      {/* Actions */}
      <RejectedActions companyId={companyId} />
    </div>
  );
}
