"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Send, Pause, XCircle, Trash2, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast-notification';
import type { JobWithAnalytics } from '@/types/jobsmarket/job-detail.types';
import type { UseJobActionsDetailReturn } from '@/hooks/jobsmarket/jobs/use-job-actions-detail';

interface StatusActionButtonsProps {
  job: JobWithAnalytics;
  actions: UseJobActionsDetailReturn;
  onSuccess: () => void;
}

export function StatusActionButtons({ job, actions, onSuccess }: StatusActionButtonsProps) {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = async (
    actionFn: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string
  ) => {
    const result = await actionFn();

    if (result.success) {
      addToast(successMessage, 'success');
      onSuccess();
    } else {
      addToast(result.error || 'เกิดข้อผิดพลาด', 'error');
    }

    setIsOpen(false);
  };

  const { availableActions, isProcessing, canDelete } = actions;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isProcessing} className="rounded-[0.625rem]">
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.includes('publish') && (
          <DropdownMenuItem onClick={() => handleAction(actions.publish, 'เผยแพร่งานเรียบร้อย')}>
            <Send className="h-4 w-4 mr-2" />
            เผยแพร่
          </DropdownMenuItem>
        )}

        {availableActions.includes('unpublish') && (
          <DropdownMenuItem onClick={() => handleAction(actions.unpublish, 'หยุดเผยแพร่งานเรียบร้อย')}>
            <Pause className="h-4 w-4 mr-2" />
            หยุดชั่วคราว
          </DropdownMenuItem>
        )}

        {availableActions.includes('close') && (
          <DropdownMenuItem onClick={() => handleAction(actions.close, 'ปิดรับสมัครเรียบร้อย')}>
            <XCircle className="h-4 w-4 mr-2" />
            ปิดรับสมัคร
          </DropdownMenuItem>
        )}

        {availableActions.includes('duplicate') && (
          <DropdownMenuItem onClick={() => handleAction(actions.duplicate, 'สร้างสำเนางานเรียบร้อย')}>
            <Copy className="h-4 w-4 mr-2" />
            สร้างสำเนา
          </DropdownMenuItem>
        )}

        {availableActions.includes('delete') && canDelete && (
          <DropdownMenuItem
            onClick={() => handleAction(actions.deleteJob, 'ลบงานเรียบร้อย')}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            ลบ
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
