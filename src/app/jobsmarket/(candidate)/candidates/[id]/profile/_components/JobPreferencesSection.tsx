"use client";

import { useEffect, useState } from "react";
import { Pencil, Target, AlertCircle } from "lucide-react";
import { candidatePreferences } from "@/types/candidate.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { webCandidatePreferenceGetById } from "@/lib/database/actions/candidate-preference";

interface JobPreferencesSectionProps {
  candidateUid: string;
  onEdit: () => void;
}

/**
 * CAND-R02 Batch 3C + 4C: Job Preferences Section
 *
 * Summary view of job preferences with edit button.
 * Now includes proper error handling (Batch 4C fix).
 */
export function JobPreferencesSection({
  candidateUid,
  onEdit,
}: JobPreferencesSectionProps) {
  const [preference, setPreference] = useState<candidatePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreference() {
      try {
        const data = await webCandidatePreferenceGetById(candidateUid);
        setPreference(data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
        setError("ไม่สามารถโหลดความต้องการงานได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    fetchPreference();
  }, [candidateUid]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "-";
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
    }
    if (min) return `${min.toLocaleString()} บาท ขึ้นไป`;
    return `ไม่เกิน ${max?.toLocaleString()} บาท`;
  };

  const getAvailabilityLabel = (value?: string): string => {
    const labels: Record<string, string> = {
      "0": "ทันที",
      "7": "ภายใน 1 สัปดาห์",
      "14": "ภายใน 2 สัปดาห์",
      "30": "ภายใน 1 เดือน",
      "60": "ภายใน 2 เดือน",
      "90": "ภายใน 3 เดือน",
      "365": "ระบุวันที่",
    };
    return value ? labels[value] || value : "-";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">ความต้องการงาน</h2>
          <Button
            onClick={onEdit}
            variant="ghost"
            size="default"
            className="text-blue-600 hover:text-blue-700 gap-2"
          >
            <Pencil className="w-4 h-4" />
            แก้ไข
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">ความต้องการงาน</h2>
          <Button
            onClick={onEdit}
            variant="ghost"
            size="default"
            className="text-blue-600 hover:text-blue-700 gap-2"
          >
            <Pencil className="w-4 h-4" />
            แก้ไข
          </Button>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-1">ไม่สามารถโหลดข้อมูล</h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                รีเฟรช
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasPreference = preference && (
    preference.myPreferredJobs?.length ||
    preference.preferredPosition ||
    preference.expectedSalary
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">ความต้องการงาน</h2>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="default"
          className="text-blue-600 hover:text-blue-700 gap-2"
        >
          <Pencil className="w-4 h-4" />
          แก้ไข
        </Button>
      </div>

      {!hasPreference ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 italic mb-2">ยังไม่ได้ตั้งค่าความต้องการงาน</p>
          <p className="text-sm text-gray-400">คลิกแก้ไขเพื่อตั้งค่าความต้องการงาน</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Job Types */}
          {preference.myPreferredJobs && preference.myPreferredJobs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                ประเภทงานที่สนใจ
              </h3>
              <div className="flex flex-wrap gap-2">
                {preference.myPreferredJobs.map((type, index) => (
                  <Badge key={index} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Position */}
          {preference.preferredPosition && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                ตำแหน่งที่สนใจ
              </h3>
              <p className="text-sm text-gray-900">{preference.preferredPosition}</p>
            </div>
          )}

          {/* Salary Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              เงินเดือนที่คาดหวัง
            </h3>
            <p className="text-sm text-gray-900">
              {formatSalary(preference.expectedSalary, preference.expectedSalary)}
              {preference.isNegotiable && (
                <span className="text-gray-500 ml-2">(ต่อรองได้)</span>
              )}
            </p>
          </div>

          {/* Location */}
          {preference.jobLocation && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                สถานที่ทำงาน
              </h3>
              <p className="text-sm text-gray-900">{preference.jobLocation}</p>
            </div>
          )}

          {/* Availability */}
          {preference.overheadDays && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                ความพร้อมเริ่มงาน
              </h3>
              <p className="text-sm text-gray-900">
                {getAvailabilityLabel(preference.overheadDays)}
              </p>
            </div>
          )}

          {/* Employment Type */}
          {preference.employment && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                รูปแบบการจ้างงาน
              </h3>
              <p className="text-sm text-gray-900">{preference.employment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
