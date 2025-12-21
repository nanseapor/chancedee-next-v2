'use client';

import Link from 'next/link';
import { Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RejectedActionsProps {
  companyId: string;
  className?: string;
}

export default function RejectedActions({
  companyId,
  className,
}: RejectedActionsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold">ดำเนินการต่อ</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Edit Profile - Primary action */}
        <Link href={`/jobsmarket/companies/${companyId}/settings`} className="block">
          <Button className="w-full justify-start" size="lg">
            <Settings className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">แก้ไขข้อมูลบริษัท</p>
              <p className="text-xs opacity-80">ปรับปรุงข้อมูลและส่งใหม่</p>
            </div>
          </Button>
        </Link>

        {/* Contact Support - Secondary action */}
        <Link href="/jobsmarket/support" className="block">
          <Button variant="outline" className="w-full justify-start" size="lg">
            <HelpCircle className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">ติดต่อฝ่ายสนับสนุน</p>
              <p className="text-xs text-muted-foreground">สอบถามรายละเอียดเพิ่มเติม</p>
            </div>
          </Button>
        </Link>

        {/* Info text */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          หลังแก้ไขข้อมูลแล้ว ระบบจะส่งให้ทีมงานตรวจสอบอีกครั้ง
        </p>
      </CardContent>
    </Card>
  );
}
