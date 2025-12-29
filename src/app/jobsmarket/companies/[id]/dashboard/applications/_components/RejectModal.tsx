/**
 * COMP-R08 Phase 4: Reject Confirmation Modal
 *
 * Modal dialog for rejecting applications with optional feedback.
 * Includes textarea for feedback message to candidate.
 *
 * Per COMP-R08 RIS §3 (JOB-017) and BLS-04 §6
 */

'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (feedback: string) => void;
  isSubmitting: boolean;
  candidateName: string;
  jobTitle: string;
}

export function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  candidateName,
  jobTitle,
}: RejectModalProps) {
  const [feedback, setFeedback] = useState('');

  const handleConfirm = () => {
    onConfirm(feedback);
  };

  const handleClose = () => {
    setFeedback(''); // Reset feedback on close
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold tracking-wide">
            ปฏิเสธใบสมัคร
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base tracking-wider leading-relaxed">
            คุณต้องการปฏิเสธใบสมัครของ <span className="font-medium text-gray-900">{candidateName}</span>{' '}
            สำหรับตำแหน่ง <span className="font-medium text-gray-900">{jobTitle}</span> หรือไม่?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 my-4">
          <Label htmlFor="feedback" className="text-sm font-medium tracking-wider">
            ข้อความถึงผู้สมัคร <span className="text-gray-400 text-xs">(ไม่บังคับ)</span>
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isSubmitting}
            placeholder="เช่น ขอบคุณที่สนใจตำแหน่งงานนี้ แต่ขณะนี้เราเลือกผู้สมัครท่านอื่นแล้ว"
            className="min-h-[100px] tracking-wider"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 tracking-widest">
            {feedback.length}/500 ตัวอักษร
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isSubmitting}>
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white font-medium tracking-widest"
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
