'use client';

import Link from 'next/link';
import { Plus, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsProps {
  companyId: string;
  canPostJobs: boolean;
  className?: string;
}

export default function QuickActions({
  companyId,
  canPostJobs,
  className,
}: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">ดำเนินการด่วน</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Create Job - Primary */}
        {canPostJobs ? (
          <Link href={`/companies/${companyId}/dashboard/jobs/new`} className="block">
            <Button className="w-full justify-start bg-primary" size="lg">
              <Plus className="w-5 h-5 mr-3" />
              สร้างประกาศงาน
            </Button>
          </Link>
        ) : (
          <div className="relative">
            <Button className="w-full justify-start bg-primary" size="lg" disabled>
              <Plus className="w-5 h-5 mr-3" />
              สร้างประกาศงาน
            </Button>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ไม่มีสิทธิ์
            </span>
          </div>
        )}

        {/* View Applications - Secondary */}
        <Link href={`/companies/${companyId}/dashboard/applications`} className="block">
          <Button variant="outline" className="w-full justify-start border" size="lg">
            <FileText className="w-5 h-5 mr-3" />
            ดูใบสมัคร
          </Button>
        </Link>

        {/* Browse Candidates - Disabled (Coming Soon) */}
        <div className="relative">
          <Button variant="outline" className="w-full justify-start border" size="lg" disabled>
            <Search className="w-5 h-5 mr-3" />
            ค้นหาผู้สมัคร
          </Button>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            เร็วๆ นี้
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
