import { Suspense } from 'react';
import type { Metadata } from 'next';
import { JobsClient } from './_components/JobsClient';
import type { EmploymentType, EducationLevel, ExperienceRange, WorkMode, JobSortOption } from '@/types/public-jobs';

export const metadata: Metadata = {
  title: 'หางาน | Chancedee Jobs',
  description: 'ค้นหางานที่ใช่สำหรับคุณ กรองตามสถานที่ เงินเดือน ประเภทงาน และอื่นๆ',
};

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string | string[];
    type?: string | string[];
    salary_min?: string;
    salary_max?: string;
    education?: string | string[];
    experience?: string;
    remote?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;

  // Parse and validate salary params (ignore malformed values)
  const parseSalary = (value: string | undefined): number | null => {
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 0 ? null : parsed;
  };

  // Parse and validate page number (default to 1 if invalid)
  const parsePage = (value: string | undefined): number => {
    if (!value) return 1;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  };

  // Parse URL search params to initial filter state
  const initialFilters = {
    keyword: params.q || '',
    locations: Array.isArray(params.location)
      ? params.location
      : params.location
      ? [params.location]
      : [],
    types: (Array.isArray(params.type) ? params.type : params.type ? [params.type] : []) as EmploymentType[],
    salaryMin: parseSalary(params.salary_min),
    salaryMax: parseSalary(params.salary_max),
    education: (Array.isArray(params.education)
      ? params.education
      : params.education
      ? [params.education]
      : []) as EducationLevel[],
    experience: (params.experience as ExperienceRange) || null,
    remote: (params.remote as WorkMode) || null,
  };

  const initialSort = (params.sort as JobSortOption) || 'newest';
  const initialPage = parsePage(params.page);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-sm text-muted-foreground">กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <JobsClient
        initialFilters={initialFilters}
        initialSort={initialSort}
        initialPage={initialPage}
      />
    </Suspense>
  );
}
