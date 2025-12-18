import Link from "next/link";

import { jobApplicationData } from "@/types/job-application.types";

/**
 * Application Summary Component
 * Per CAND-R01 RIS §3.2.5
 *
 * Features:
 * - 4 status cards: Applied, Reviewing, Interviewing, Offers
 * - Count applications by status
 * - Links to filtered applications page
 * - Loading state support
 */

export interface ApplicationSummaryProps {
  applications: jobApplicationData[];
  isLoading?: boolean;
}

interface StatusCardData {
  key: string;
  titleTh: string;
  titleEn: string;
  icon: string;
  color: string;
  bgColor: string;
  statuses: string[]; // Firestore enum values
}

const STATUS_CARDS: StatusCardData[] = [
  {
    key: "applied",
    titleTh: "ส่งใบสมัครแล้ว",
    titleEn: "Applied",
    icon: "📝",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    statuses: ["new", "read"], // new = applied, read = viewed by company
  },
  {
    key: "reviewing",
    titleTh: "รอการพิจารณา",
    titleEn: "Reviewing",
    icon: "🔍",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    statuses: ["accepted"], // accepted = reviewing (waiting for interview)
  },
  {
    key: "interviewing",
    titleTh: "กำลังสัมภาษณ์",
    titleEn: "Interviewing",
    icon: "💼",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    statuses: ["scheduled", "confirmed"], // interview scheduled/confirmed
  },
  {
    key: "offers",
    titleTh: "ได้รับข้อเสนอ",
    titleEn: "Offers",
    icon: "🎉",
    color: "text-green-600",
    bgColor: "bg-green-100",
    statuses: [], // No "offer" status exists yet - future-proof
  },
];

export function ApplicationSummary({
  applications,
  isLoading = false,
}: ApplicationSummaryProps) {
  // Count applications by status group
  const getCounts = () => {
    const counts: Record<string, number> = {
      applied: 0,
      reviewing: 0,
      interviewing: 0,
      offers: 0,
    };

    applications.forEach((app) => {
      const status = app.status;
      if (!status) return; // Skip if status is undefined

      STATUS_CARDS.forEach((card) => {
        if (card.statuses.includes(status)) {
          counts[card.key] = (counts[card.key] || 0) + 1;
        }
      });
    });

    return counts;
  };

  const counts = isLoading ? null : getCounts();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          สถานะการสมัครงาน
        </h2>
        <p className="text-sm text-gray-500">Application Status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_CARDS.map((card) => (
          <StatusCard
            key={card.key}
            card={card}
            count={counts?.[card.key] ?? 0}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

interface StatusCardProps {
  card: StatusCardData;
  count: number;
  isLoading: boolean;
}

function StatusCard({ card, count, isLoading }: StatusCardProps) {
  return (
    <Link
      href={`/jobsmarket/candidates/applications?status=${card.key}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center text-xl`}
        >
          {card.icon}
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
        ) : (
          <p className={`text-3xl font-bold ${card.color} mb-1`}>{count}</p>
        )}
        <p className="text-sm font-medium text-gray-900">{card.titleTh}</p>
        <p className="text-xs text-gray-500">{card.titleEn}</p>
      </div>
    </Link>
  );
}
