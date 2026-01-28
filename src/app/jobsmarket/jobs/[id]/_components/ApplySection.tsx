'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { sessionStateAtom } from '@/store/jobsmarket/global-atoms';
import { userAtom } from '@/store/atom-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { ApplyModal } from '@/components/jobsmarket/jobs/ApplyModal';
import type { ApplyModalJob } from '@/types/jobsmarket/apply-modal.types';

type ApplyState = 'guest' | 'incomplete' | 'ready' | 'applied' | 'closed';

interface ApplySectionProps {
  job: ApplyModalJob & {
    jobStatus: string;
    companyId: string;
  };
  isJobAvailable: boolean;
  hasApplied?: boolean;
  profileCompletion?: number; // Profile completion percentage (0-100)
  onApplyAuth: () => void;
}

/**
 * Apply Section Component
 *
 * Displays apply button with 5 possible states:
 * 1. guest - Not logged in → Show login prompt
 * 2. incomplete - Profile < 80% → Redirect to profile
 * 3. ready - Can apply → Show apply action (placeholder for v1.0)
 * 4. applied - Already applied → Disabled
 * 5. closed - Job unavailable → Disabled
 */
export function ApplySection({
  job,
  isJobAvailable,
  hasApplied = false,
  profileCompletion = 0,
  onApplyAuth,
}: ApplySectionProps) {
  const router = useRouter();
  const sessionState = useAtomValue(sessionStateAtom);
  const user = useAtomValue(userAtom);
  const isAuthenticated = sessionState === 'authenticated' && user;
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Profile completion threshold
  const isProfileComplete = profileCompletion >= 80;

  // Determine apply state
  const getApplyState = (): ApplyState => {
    if (!isJobAvailable) return 'closed';
    if (!isAuthenticated) return 'guest';
    if (hasApplied) return 'applied';
    if (!isProfileComplete) return 'incomplete';
    return 'ready';
  };

  const applyState = getApplyState();

  const handleApply = () => {
    switch (applyState) {
      case 'guest':
        onApplyAuth();
        break;
      case 'incomplete':
        router.push(`/candidates/profile?from=apply&job=${job.uid}`);
        break;
      case 'ready':
        setShowApplyModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">สมัครงานนี้</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* State-specific message */}
        {applyState === 'closed' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock size={16} />
            <span className="text-sm">ตำแหน่งนี้ปิดรับสมัครแล้ว</span>
          </div>
        )}

        {applyState === 'applied' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} />
            <span className="text-sm">คุณสมัครงานนี้แล้ว</span>
          </div>
        )}

        {applyState === 'incomplete' && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle size={16} />
            <span className="text-sm">
              กรุณากรอกโปรไฟล์ให้ครบก่อนสมัคร ({profileCompletion}% สมบูรณ์)
            </span>
          </div>
        )}

        {/* Apply Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleApply}
          disabled={applyState === 'closed' || applyState === 'applied'}
        >
          {applyState === 'closed' && 'ปิดรับสมัครแล้ว'}
          {applyState === 'applied' && 'สมัครแล้ว'}
          {applyState === 'incomplete' && 'กรอกโปรไฟล์ก่อนสมัคร'}
          {applyState === 'guest' && 'เข้าสู่ระบบเพื่อสมัคร'}
          {applyState === 'ready' && 'สมัครงานนี้'}
        </Button>

        {/* Quick apply hint */}
        {applyState === 'ready' && (
          <p className="text-xs text-muted-foreground text-center">
            สมัครได้ทันทีด้วยโปรไฟล์ ChanceDee ของคุณ
          </p>
        )}
      </CardContent>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={job}
        onSuccess={() => {
          // TODO: Update local state to show "applied" status
          setShowApplyModal(false);
        }}
      />
    </Card>
  );
}
