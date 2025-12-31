/**
 * Apply Modal Component
 *
 * Main modal container for job application flow
 * Based on JOB-R02b RIS Section 3-4
 */

'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ApplyForm } from './ApplyForm';
import { JobSummaryCard } from './JobSummaryCard';
import type { ApplyFormData, ApplyModalState, ApplyModalJob } from '@/types/jobsmarket/apply-modal.types';
import { submitApplication } from '@/lib/database/actions/job-applications';
import { userAtom } from '@/store/atom-store';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ApplyModalJob;
  onSuccess?: () => void;
}

/**
 * Apply Modal
 *
 * Handles the complete application flow:
 * - Form editing state
 * - Submit loading state
 * - Success state with toast
 * - Error handling
 *
 * State machine based on RIS Section 4.1
 */
export function ApplyModal({ isOpen, onClose, job, onSuccess }: ApplyModalProps) {
  const [user] = useAtom(userAtom);
  const [state, setState] = useState<ApplyModalState>('editing');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ApplyFormData) => {
    setState('submitting');
    setError(null);

    try {
      // Get current user ID
      const candidateId = user?.uid;
      if (!candidateId) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนสมัครงาน');
      }

      // Call submitApplication server action (BLS-03-01)
      const result = await submitApplication(
        {
          jobId: job.uid,
          expectedSalary: formData.expectedSalary,
          isNegotiable: formData.isNegotiable,
          overheadDays: formData.overheadDays as 0 | 7 | 15 | 30 | 60 | 90,
          headlines: formData.headlines,
        },
        candidateId
      );

      if (result.success) {
        setState('success');
        // Call success callback after brief delay
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        // Handle error responses
        const errorMessages: Record<string, string> = {
          PROFILE_INCOMPLETE: 'กรุณากรอกข้อมูลโปรไฟล์ให้ครบถ้วนก่อนสมัครงาน',
          JOB_NOT_FOUND: 'ไม่พบตำแหน่งงานนี้',
          JOB_CLOSED: 'ตำแหน่งงานนี้ปิดรับสมัครแล้ว',
          ALREADY_APPLIED: 'คุณได้สมัครงานนี้ไปแล้ว',
          NETWORK_ERROR: 'ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่อีกครั้ง',
        };
        throw new Error(errorMessages[result.error || 'NETWORK_ERROR']);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
      setState('editing');
    }
  };

  const handleClose = () => {
    // Prevent close during submission
    if (state === 'submitting') return;

    // Reset state
    setState('editing');
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setState('editing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Editing State - Show Form */}
        {state === 'editing' && (
          <>
            <DialogHeader>
              <DialogTitle>สมัครงาน</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลเพื่อสมัครงานตำแหน่งนี้
              </DialogDescription>
            </DialogHeader>

            <JobSummaryCard job={job} />

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-red-600 hover:text-red-800"
                    onClick={handleRetry}
                  >
                    ลองอีกครั้ง
                  </Button>
                </div>
              </div>
            )}

            <ApplyForm onSubmit={handleSubmit} onCancel={handleClose} isSubmitting={false} />
          </>
        )}

        {/* Submitting State - Loading Spinner */}
        {state === 'submitting' && (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">กำลังส่งใบสมัคร...</p>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">ส่งใบสมัครเรียบร้อย!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              เราได้รับใบสมัครของคุณแล้ว
            </p>
            <p className="text-sm text-muted-foreground">
              บริษัทจะติดต่อกลับเร็วๆ นี้
            </p>
            <Button onClick={handleClose} className="mt-4">
              ปิด
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
