'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanyAuth } from '@/hooks/jobsmarket/company';
import { MinimalShell } from '@/components/jobsmarket/company';
import PendingSkeleton from './PendingSkeleton';
import PendingStatusCard from './PendingStatusCard';
import RejectedStatusCard from './RejectedStatusCard';

interface PendingClientProps {
  companyId: string;
}

export default function PendingClient({ companyId }: PendingClientProps) {
  const router = useRouter();
  const { isLoading, access, companyStatus } = useCompanyAuth({
    companyId,
    skipRedirect: true, // We handle redirects manually for this page
  });

  // Redirect approved companies to dashboard
  useEffect(() => {
    if (!isLoading && companyStatus === 'approved') {
      router.replace(`/jobsmarket/companies/${companyId}/dashboard`);
    }
  }, [isLoading, companyStatus, companyId, router]);

  // Redirect suspended companies to suspended page
  useEffect(() => {
    if (!isLoading && companyStatus === 'suspended') {
      router.replace(`/jobsmarket/companies/${companyId}/suspended`);
    }
  }, [isLoading, companyStatus, companyId, router]);

  // Loading state
  if (isLoading) {
    return (
      <MinimalShell>
        <PendingSkeleton />
      </MinimalShell>
    );
  }

  // Not authenticated or not a member - useCompanyAuth handles redirect
  if (access.state === 'unauthorized' || access.state === 'not_member') {
    return null;
  }

  // Approved or suspended - redirect is happening
  if (companyStatus === 'approved' || companyStatus === 'suspended') {
    return (
      <MinimalShell>
        <PendingSkeleton />
      </MinimalShell>
    );
  }

  // Pending status - show pending UI
  if (companyStatus === 'pending') {
    return (
      <MinimalShell companyName="บริษัทของคุณ">
        <div className="min-h-[calc(100vh-3.5rem)] p-4 py-8">
          <PendingStatusCard
            companyId={companyId}
            companyName="บริษัทของคุณ"
            // TODO: Pass actual submittedAt from company data
          />
        </div>
      </MinimalShell>
    );
  }

  // Rejected status - show rejected UI
  if (companyStatus === 'rejected') {
    return (
      <MinimalShell companyName="บริษัทของคุณ">
        <div className="min-h-[calc(100vh-3.5rem)] p-4 py-8">
          <RejectedStatusCard
            companyId={companyId}
            companyName="บริษัทของคุณ"
            // TODO: Pass actual rejection reason from company data
            rejectionReason="ข้อมูลบริษัทไม่ครบถ้วน กรุณาเพิ่มรายละเอียดเกี่ยวกับบริษัทและอัปโหลดเอกสารยืนยันตัวตน"
            // TODO: Pass actual rejectedAt from company data
          />
        </div>
      </MinimalShell>
    );
  }

  // Fallback - should not reach here
  return (
    <MinimalShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-muted-foreground">ไม่พบข้อมูลบริษัท</p>
      </div>
    </MinimalShell>
  );
}
