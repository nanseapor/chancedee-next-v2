"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useJobApplications } from '@/hooks/jobsmarket/jobs/use-job-applications';
import { ApplicationListItem } from './ApplicationListItem';
import Link from 'next/link';

interface RecentApplicationsListProps {
  jobId: string;
}

export function RecentApplicationsList({ jobId }: RecentApplicationsListProps) {
  const { applications, isLoading } = useJobApplications(jobId, { limit: 5 });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-medium tracking-wide leading-normal">
          ใบสมัครล่าสุด
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="#">
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            ยังไม่มีใบสมัคร
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <ApplicationListItem
                key={application.applicationId}
                application={application}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
