"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, TrendingUp, FileText } from 'lucide-react';
import type { JobAnalytics } from '@/types/jobsmarket/job-detail.types';
import type { JobWithAnalytics } from '@/types/jobsmarket/job-detail.types';

interface JobStatsCardsProps {
  analytics: JobAnalytics | undefined;
  job: JobWithAnalytics;
}

export function JobStatsCards({ analytics, job }: JobStatsCardsProps) {
  const stats = [
    {
      title: 'การเข้าชม',
      value: analytics?.totalViews || 0,
      change: analytics?.viewsChange || 0,
      icon: Eye,
    },
    {
      title: 'ใบสมัคร',
      value: analytics?.applicationCount || 0,
      change: 0, // TODO: Calculate change
      icon: FileText,
    },
    {
      title: 'อัตราการสมัคร',
      value: `${(analytics?.conversionRate || 0).toFixed(1)}%`,
      change: analytics?.conversionChange || 0,
      icon: TrendingUp,
    },
    {
      title: 'ตำแหน่งว่าง',
      value: job.positions || 1,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {typeof stat.change === 'number' && stat.change !== 0 && (
              <p className={`text-xs tracking-wider ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change}% จากสัปดาห์ก่อน
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
