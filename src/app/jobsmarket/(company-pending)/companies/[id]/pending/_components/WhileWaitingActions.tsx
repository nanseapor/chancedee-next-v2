'use client';

import Link from 'next/link';
import { Users, Briefcase, Settings, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ActionItem {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  disabled?: boolean;
  disabledMessage?: string;
}

interface WhileWaitingActionsProps {
  companyId: string;
  className?: string;
}

export default function WhileWaitingActions({
  companyId,
  className,
}: WhileWaitingActionsProps) {
  const actions: ActionItem[] = [
    {
      key: 'browse-candidates',
      label: 'ดูผู้สมัครงาน',
      description: 'เรียกดูโปรไฟล์ผู้สมัครที่น่าสนใจ',
      icon: Users,
      href: `/candidates/browse`,
      disabled: true,
      disabledMessage: 'จะพร้อมใช้งานหลังอนุมัติ',
    },
    {
      key: 'prepare-jobs',
      label: 'เตรียมประกาศงาน',
      description: 'ร่างประกาศงานไว้ล่วงหน้า',
      icon: Briefcase,
      href: `/companies/${companyId}/dashboard/jobs/new`,
      disabled: true,
      disabledMessage: 'จะพร้อมใช้งานหลังอนุมัติ',
    },
    {
      key: 'edit-profile',
      label: 'แก้ไขข้อมูลบริษัท',
      description: 'ปรับปรุงข้อมูลให้สมบูรณ์',
      icon: Settings,
      href: `/companies/${companyId}/dashboard/settings`,
      disabled: false,
    },
    {
      key: 'support',
      label: 'ติดต่อฝ่ายสนับสนุน',
      description: 'สอบถามสถานะหรือขอความช่วยเหลือ',
      icon: HelpCircle,
      href: '/support',
      disabled: false,
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-semibold text-center">
        ระหว่างรอการอนุมัติ
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <Card
              className={cn(
                'transition-colors',
                action.disabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-muted/50 cursor-pointer'
              )}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    action.disabled ? 'bg-muted' : 'bg-primary/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      action.disabled ? 'text-muted-foreground' : 'text-primary'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.disabled ? action.disabledMessage : action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );

          if (action.disabled) {
            return <div key={action.key}>{content}</div>;
          }

          return (
            <Link key={action.key} href={action.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
