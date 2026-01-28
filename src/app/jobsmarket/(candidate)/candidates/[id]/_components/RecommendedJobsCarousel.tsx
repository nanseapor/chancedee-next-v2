"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { webJobGetByFilter } from "@/lib/database/actions/jobs";
import { FirebaseJobData } from "@/types/job.types";

/**
 * Recommended Jobs Carousel Component
 * Per CAND-R01 RIS §3.2.7
 *
 * Features:
 * - Mock recommendation logic (simple matching)
 * - Horizontal scrollable carousel
 * - Job cards with title, company, salary, location
 * - Empty state when no matches
 * - Link to job details
 *
 * Mock Logic:
 * - Filter active jobs (is_closed=false)
 * - Match by candidate's industry or job type preferences
 * - Limit to 10 jobs
 */

export interface RecommendedJobsCarouselProps {
  candidateId: string;
}

export function RecommendedJobsCarousel({
  candidateId,
}: RecommendedJobsCarouselProps) {
  const [recommendedJobs, setRecommendedJobs] = useState<FirebaseJobData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch candidate profile for preferences
  const { data: profile } = useSWR(["candidate-profile", candidateId], () =>
    webCandidateInformationGetById(candidateId)
  );

  // Fetch jobs and apply mock recommendation logic
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setIsLoading(true);

        // Fetch all active jobs (is_closed = false)
        const allJobs = await webJobGetByFilter(false);

        if (!allJobs || allJobs.length === 0) {
          setRecommendedJobs([]);
          return;
        }

        // Mock recommendation logic:
        // TODO: Implement preference-based filtering when jobTypePreference field is available
        // For now, just return first 10 active jobs
        const recommended = allJobs.slice(0, 10);
        setRecommendedJobs(recommended);
      } catch (error) {
        console.error("Failed to fetch recommended jobs:", error);
        setRecommendedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, [profile]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            งานที่แนะนำสำหรับคุณ
          </h2>
          <p className="text-sm text-gray-500">Recommended Jobs</p>
        </div>
        <Link
          href="/jobs"
          className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[calc(100vw-4rem)] sm:w-72 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : recommendedJobs.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            ไม่พบงานที่แนะนำ
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            ลองอัปเดตโปรไฟล์และความต้องการของคุณ
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div className="flex gap-4 pb-4">
            {recommendedJobs.map((job) => (
              <JobCard key={job.uid} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: FirebaseJobData }) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "เงินเดือนตามตกลง";
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
    }
    if (min) return `${min.toLocaleString()}+ บาท`;
    return "เงินเดือนตามตกลง";
  };

  return (
    <Link
      href={`/jobs/${job.uid}`}
      className="flex-shrink-0 w-[calc(100vw-4rem)] sm:w-72 bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      {/* Company Logo or Icon */}
      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-3">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={job.companyName || "Company"}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      {/* Job Title */}
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
        {job.title || "ไม่ระบุตำแหน่ง"}
      </h3>

      {/* Company Name */}
      <p className="text-sm text-gray-600 mb-3">
        {job.companyName || "ไม่ระบุบริษัท"}
      </p>

      {/* Salary */}
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm text-gray-700">
          {formatSalary(job.minSalary, job.maxSalary)}
        </span>
      </div>

      {/* Location */}
      {job.workLocationText && (
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm text-gray-600 truncate">
            {job.workLocationText}
          </span>
        </div>
      )}

      {/* Job Type Badge */}
      {job.jobType && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            {job.jobType}
          </span>
        </div>
      )}
    </Link>
  );
}
