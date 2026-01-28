'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  companyName: string;
  isLoading?: boolean;
}

/**
 * WithdrawModal - Confirmation dialog for withdrawing application
 *
 * Features:
 * - Warning icon and message
 * - Shows job title and company name for confirmation
 * - Cancel and Confirm actions
 * - Loading state during withdrawal
 */
export default function WithdrawModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  companyName,
  isLoading = false,
}: WithdrawModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-left">ยืนยันการถอนใบสมัคร</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-2">
            <p>คุณต้องการถอนใบสมัครงานนี้ใช่หรือไม่?</p>
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="text-sm font-medium text-gray-900">{jobTitle}</p>
              <p className="text-sm text-gray-600">{companyName}</p>
            </div>
            <p className="text-sm text-red-600 mt-3">
              <strong>หมายเหตุ:</strong> การถอนใบสมัครไม่สามารถยกเลิกได้
              และคุณจะไม่สามารถสมัครงานนี้อีกครั้งได้
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันถอนใบสมัคร'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
