'use client';

import { Check, Clock, FileText, Search, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
}

const APPROVAL_STEPS: Step[] = [
  {
    id: 1,
    label: 'ส่งข้อมูล',
    description: 'ส่งข้อมูลบริษัทเรียบร้อย',
    icon: FileText,
  },
  {
    id: 2,
    label: 'รอตรวจสอบ',
    description: 'ทีมงานกำลังตรวจสอบข้อมูล',
    icon: Clock,
  },
  {
    id: 3,
    label: 'ยืนยันข้อมูล',
    description: 'ตรวจสอบความถูกต้อง',
    icon: Search,
  },
  {
    id: 4,
    label: 'อนุมัติ',
    description: 'รอการอนุมัติจากผู้ดูแล',
    icon: Check,
  },
  {
    id: 5,
    label: 'เสร็จสิ้น',
    description: 'พร้อมใช้งาน',
    icon: CheckCircle,
  },
];

interface ApprovalStepperProps {
  /** Current step (1-5), default is 2 for pending companies */
  currentStep?: number;
  className?: string;
}

export default function ApprovalStepper({
  currentStep = 2,
  className,
}: ApprovalStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Horizontal stepper */}
      <div className="hidden md:flex items-center justify-between">
        {APPROVAL_STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle and content */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-primary/10 border-primary text-primary',
                    isPending && 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[100px]">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < APPROVAL_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mt-[-2rem]',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical stepper */}
      <div className="md:hidden space-y-4">
        {APPROVAL_STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-primary/10 border-primary text-primary',
                  isPending && 'bg-muted border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {isCurrent && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  ปัจจุบัน
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { APPROVAL_STEPS };
