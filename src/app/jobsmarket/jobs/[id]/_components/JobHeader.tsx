import Link from 'next/link';
import Image from 'next/image';
import { JobDetailData } from '@/types/public-jobs';
import { Clock } from 'lucide-react';

interface JobHeaderProps {
  job: JobDetailData;
}

/**
 * Utility function to format relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} เดือนที่แล้ว`;
  if (weeks > 0) return `${weeks} สัปดาห์ที่แล้ว`;
  if (days > 0) return `${days} วันที่แล้ว`;
  if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
  if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
  return 'เมื่อสักครู่';
}

/**
 * Job Header Component
 *
 * Displays:
 * - Company logo
 * - Job title
 * - Company name (linked)
 * - Posted date
 */
export function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <Link
          href={`/jobsmarket/companies/${job.companyId}`}
          className="shrink-0"
        >
          <div className="w-16 h-16 relative rounded-md overflow-hidden border bg-muted">
            {job.companyLogo ? (
              <Image
                src={job.companyLogo}
                alt={job.companyName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground font-medium">
                {job.companyName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Title & Company */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-semibold tracking-wide leading-snug">
            {job.title}
          </h1>

          <Link
            href={`/jobsmarket/companies/${job.companyId}`}
            className="text-base text-secondary-700 hover:underline mt-1 inline-block"
          >
            {job.companyName}
          </Link>
        </div>
      </div>

      {/* Posted Date */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock size={14} />
        <span>โพสต์เมื่อ {formatRelativeTime(job.postStartDate)}</span>
      </div>
    </div>
  );
}
