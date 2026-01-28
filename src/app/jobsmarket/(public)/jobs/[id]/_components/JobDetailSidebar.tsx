import { ApplySection } from './ApplySection';
import { CompanyInfo } from './CompanyInfo';
import type { JobDetailData } from '@/types/public-jobs';

interface JobDetailSidebarProps {
  job: JobDetailData;
  isAuthenticated: boolean;
  profileCompletion?: number;
  onApplyAuth: () => void;
}

/**
 * Job Detail Sidebar Component
 *
 * Container for sidebar components:
 * - ApplySection (apply button with state management)
 * - CompanyInfo (company card with link)
 *
 * Sticky positioning for better UX on scroll
 */
export function JobDetailSidebar({
  job,
  isAuthenticated,
  profileCompletion = 0,
  onApplyAuth,
}: JobDetailSidebarProps) {
  // Check job availability
  // eslint-disable-next-line react-hooks/purity -- Client component needs current time for job expiry check
  const now = Date.now();
  const isJobAvailable =
    job.jobStatus === 'published' &&
    (!job.postExpiryDate || job.postExpiryDate > now);

  return (
    <div className="space-y-4 sticky top-20">
      {/* Apply Section */}
      <ApplySection
        job={job}
        isJobAvailable={isJobAvailable}
        profileCompletion={profileCompletion}
        onApplyAuth={onApplyAuth}
      />

      {/* Company Info */}
      {job.company && <CompanyInfo company={job.company} />}
    </div>
  );
}
