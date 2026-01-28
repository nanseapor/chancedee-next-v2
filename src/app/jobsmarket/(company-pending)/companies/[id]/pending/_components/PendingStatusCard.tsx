'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ApprovalStepper from './ApprovalStepper';
import WhileWaitingActions from './WhileWaitingActions';

interface PendingStatusCardProps {
  companyId: string;
  companyName?: string;
  submittedAt?: Date | number;
}

export default function PendingStatusCard({
  companyId,
  companyName,
  submittedAt,
}: PendingStatusCardProps) {
  // Format date if provided
  const formattedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="max-w-2xl w-full mx-auto space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold">รอการอนุมัติ</h1>
          {companyName && (
            <p className="text-muted-foreground">{companyName}</p>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-2">
            บริษัทของคุณอยู่ระหว่างการตรวจสอบ
          </p>
          <p className="text-sm text-muted-foreground">
            โดยปกติใช้เวลา <span className="font-medium">1-3 วันทำการ</span>
          </p>
          {formattedDate && (
            <p className="text-xs text-muted-foreground mt-2">
              ส่งข้อมูลเมื่อ {formattedDate}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Approval Progress */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">ขั้นตอนการอนุมัติ</h2>
        </CardHeader>
        <CardContent>
          <ApprovalStepper currentStep={2} />
        </CardContent>
      </Card>

      {/* While Waiting Actions */}
      <WhileWaitingActions companyId={companyId} />
    </div>
  );
}
