import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicJobById } from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';
import { JobDetailData } from '@/types/public-jobs';
import { JobHeader } from './_components/JobHeader';
import { JobMetadata } from './_components/JobMetadata';
import { JobDescription } from './_components/JobDescription';
import { JobDetailClient } from './_components/JobDetailClient';
import { SimilarJobs } from './_components/SimilarJobs';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ apply?: string; from?: string }>;
}

/**
 * Determine job availability state
 * Computed once at request time for ISR caching
 */
function getJobAvailability(job: JobDetailData, requestTime: number): {
  isAvailable: boolean;
  isExpired: boolean;
  message: string | null;
} {
  const isPublished = job.jobStatus === 'published' || job.jobStatus === 'ontimer';
  const isExpired = job.postExpiryDate > 0 && requestTime > job.postExpiryDate;

  if (!job.isActive || !isPublished) {
    return {
      isAvailable: false,
      isExpired: false,
      message: 'ตำแหน่งนี้ปิดรับสมัครแล้ว',
    };
  }

  if (isExpired) {
    return {
      isAvailable: false,
      isExpired: true,
      message: 'ตำแหน่งนี้หมดเขตรับสมัครแล้ว',
    };
  }

  return {
    isAvailable: true,
    isExpired: false,
    message: null,
  };
}

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getPublicJobById(id);

  if (!job) {
    return {
      title: 'ไม่พบงาน | ChanceDee',
      robots: 'noindex, nofollow',
    };
  }

  // Format salary for description
  const formatSalary = () => {
    if (job.isNegotiable && !job.minSalary && !job.maxSalary) {
      return 'เงินเดือนตามตกลง';
    }
    if (!job.minSalary && !job.maxSalary) {
      return '';
    }
    if (job.minSalary && job.maxSalary) {
      if (job.minSalary === job.maxSalary) {
        return `฿${new Intl.NumberFormat('th-TH').format(job.minSalary)}`;
      }
      return `฿${new Intl.NumberFormat('th-TH').format(job.minSalary)} - ฿${new Intl.NumberFormat('th-TH').format(job.maxSalary)}`;
    }
    if (job.minSalary) {
      return `฿${new Intl.NumberFormat('th-TH').format(job.minSalary)}+`;
    }
    if (job.maxSalary) {
      return `สูงสุด ฿${new Intl.NumberFormat('th-TH').format(job.maxSalary)}`;
    }
    return '';
  };

  const salary = formatSalary();
  const description = [
    job.title,
    `ที่ ${job.companyName}`,
    salary,
    job.workLocationText,
  ]
    .filter(Boolean)
    .join(' - ')
    .substring(0, 160);

  return {
    title: `${job.title} | ${job.companyName} | ChanceDee`,
    description,
    openGraph: {
      title: `${job.title} - ${job.companyName}`,
      description,
      type: 'website',
      url: `https://jobs.chancedee.com/jobs/${job.uid}`,
      images: [
        {
          url: job.companyLogo || '/images/og-default-job.png',
          width: 1200,
          height: 630,
          alt: `${job.title} ที่ ${job.companyName}`,
        },
      ],
      siteName: 'ChanceDee',
      locale: 'th_TH',
    },
    robots: job.isActive && job.jobStatus === 'published' ? 'index, follow' : 'noindex, nofollow',
  };
}

/**
 * Job Detail Page (JOB-R02)
 *
 * Route: /jobs/[id]
 * ISR: 300s revalidation
 *
 * Shows full job details with:
 * - Job header (title, company, posted date)
 * - Job metadata (salary, location, employment type)
 * - Job description (rich text content)
 * - Sidebar with apply CTA (Phase 2)
 * - Similar jobs carousel (Phase 3)
 * - Deep link support: ?apply=true, ?from=search
 */
export default async function JobDetailPage({ params, searchParams }: JobDetailPageProps) {
  const { id } = await params;
  const search = await searchParams;
  const job = await getPublicJobById(id);

  // Job not found or not available
  if (!job) {
    notFound();
  }

  // Get current time outside component for ISR caching
  // eslint-disable-next-line react-hooks/purity -- Server component runs once per request
  const now = Date.now();

  // Determine job availability at request time
  const availability = getJobAvailability(job, now);

  // Deep link support
  const shouldAutoApply = search.apply === 'true';
  const referrer = search.from;

  return (
    <div className="container mx-auto px-4 py-6">
      <JobDetailClient job={job} autoApply={shouldAutoApply} referrer={referrer}>
        <JobHeader job={job} />
        <JobMetadata job={job} />

        {/* Unavailable State Banner */}
        {availability.message && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <p className="text-amber-800 font-medium">{availability.message}</p>
          </div>
        )}

        <JobDescription job={job} />

        {/* Similar Jobs Section */}
        <SimilarJobs jobId={job.uid} limit={6} />
      </JobDetailClient>
    </div>
  );
}
