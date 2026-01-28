"use client";

import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  error?: string;
}

export function SaveStatusIndicator({ status, lastSaved, error }: SaveStatusIndicatorProps) {
  const statusConfig = {
    idle: {
      icon: Cloud,
      text: 'พร้อมบันทึก',
      className: 'text-gray-400',
    },
    saving: {
      icon: Loader2,
      text: 'กำลังบันทึก...',
      className: 'text-blue-500',
      animate: true,
    },
    saved: {
      icon: Check,
      text: lastSaved
        ? `บันทึกแล้วเมื่อ ${lastSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
        : 'บันทึกแล้ว',
      className: 'text-green-500',
    },
    error: {
      icon: AlertCircle,
      text: error || 'บันทึกไม่สำเร็จ',
      className: 'text-red-500',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", config.className)}>
      <Icon className={cn("h-4 w-4", 'animate' in config && config.animate && "animate-spin")} />
      <span>{config.text}</span>
    </div>
  );
}
