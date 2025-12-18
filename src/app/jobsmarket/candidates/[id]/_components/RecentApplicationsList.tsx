import Link from "next/link";

import { jobApplicationData } from "@/types/job-application.types";
import { getRelativeTimeThai } from "@/lib/utils/date-th";

/**
 * Recent Applications List Component
 * Per CAND-R01 RIS §3.2.6
 *
 * Features:
 * - Display last 5 applications
 * - Show job title, company, status, time
 * - Empty state when no applications
 * - Link to application details
 */

export interface RecentApplicationsListProps {
  applications: jobApplicationData[];
  isLoading?: boolean;
}

export function RecentApplicationsList({
  applications,
  isLoading = false,
}: RecentApplicationsListProps) {
  // Sort by created_at desc and take first 5
  const recentApps = [...applications]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            ใบสมัครล่าสุด
          </h2>
          <p className="text-sm text-gray-500">Recent Applications</p>
        </div>
        {applications.length > 0 && (
          <Link
            href={`/jobsmarket/candidates/applications`}
            className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
          >
            ดูทั้งหมด →
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : recentApps.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            ยังไม่มีใบสมัครงาน
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            เริ่มค้นหางานและสมัครงานที่คุณสนใจ
          </p>
          <div className="mt-6">
            <Link
              href="/jobsmarket/jobs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
            >
              ค้นหางาน
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {recentApps.map((app) => (
            <ApplicationCard key={app.uid} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
}: {
  application: jobApplicationData;
}) {
  const relativeTime = getRelativeTimeThai(application.createdAt || 0);

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { labelTh: string; labelEn: string; color: string }
    > = {
      new: {
        labelTh: "ใหม่",
        labelEn: "New",
        color: "bg-blue-100 text-blue-700",
      },
      read: {
        labelTh: "อ่านแล้ว",
        labelEn: "Read",
        color: "bg-gray-100 text-gray-700",
      },
      accepted: {
        labelTh: "รอสัมภาษณ์",
        labelEn: "Reviewing",
        color: "bg-amber-100 text-amber-700",
      },
      scheduled: {
        labelTh: "นัดสัมภาษณ์",
        labelEn: "Scheduled",
        color: "bg-purple-100 text-purple-700",
      },
      confirmed: {
        labelTh: "ยืนยันนัดหมาย",
        labelEn: "Confirmed",
        color: "bg-purple-100 text-purple-700",
      },
      rejected: {
        labelTh: "ไม่ผ่าน",
        labelEn: "Rejected",
        color: "bg-red-100 text-red-700",
      },
    };

    return (
      badges[status] || {
        labelTh: status,
        labelEn: status,
        color: "bg-gray-100 text-gray-700",
      }
    );
  };

  const statusBadge = getStatusBadge(application.status);

  return (
    <Link
      href={`/jobsmarket/candidates/applications/${application.uid}`}
      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {application.jobTitle || "ไม่ระบุตำแหน่ง"}
          </p>
          <p className="text-sm text-gray-600 truncate mt-1">
            {application.companyName || "ไม่ระบุบริษัท"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge.color}`}
            >
              {statusBadge.labelTh}
            </span>
            <span className="text-xs text-gray-500">{relativeTime}</span>
          </div>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
