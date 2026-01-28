import Link from "next/link";

import { FirebaseJobInterviewData } from "@/types/interview.types";
import { formatThaiDate, formatThaiTime } from "@/lib/utils/date-th";

/**
 * Appointments Section Component
 * Per CAND-R01 RIS §3.2.4
 *
 * Features:
 * - Display upcoming interviews (max 5)
 * - Show appointment time, company, location
 * - Link to interview details
 * - Only shown if there are upcoming interviews
 */

export interface AppointmentsSectionProps {
  interviews: FirebaseJobInterviewData[];
}

export function AppointmentsSection({
  interviews,
}: AppointmentsSectionProps) {
  if (!interviews || interviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            นัดหมายที่กำลังจะถึง
          </h2>
          <p className="text-sm text-gray-500">Upcoming Appointments</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        {interviews.map((interview) => (
          <AppointmentCard key={interview.uid} interview={interview} />
        ))}
      </div>
    </div>
  );
}

function AppointmentCard({
  interview,
}: {
  interview: FirebaseJobInterviewData;
}) {
  const appointmentDate = new Date(interview.appointment);
  const dateStr = formatThaiDate(appointmentDate, "short");
  const timeStr = formatThaiTime(appointmentDate);

  // Determine channel icon and label
  const channelInfo = {
    online: { icon: "🖥️", labelTh: "ออนไลน์", labelEn: "Online" },
    onsite: { icon: "🏢", labelTh: "ที่บริษัท", labelEn: "On-site" },
    phone: { icon: "📞", labelTh: "โทรศัพท์", labelEn: "Phone" },
  }[interview.channel] || {
    icon: "📅",
    labelTh: interview.channel,
    labelEn: interview.channel,
  };

  return (
    <Link
      href={`/candidates/${interview.candidateId}/applications/${interview.applicationId}`}
      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl flex-shrink-0">
          {channelInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {interview.companyName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-600">
              {dateStr} เวลา {timeStr}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-600">
              {channelInfo.labelTh}
            </span>
          </div>
          {interview.location && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              📍 {interview.location}
            </p>
          )}
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
