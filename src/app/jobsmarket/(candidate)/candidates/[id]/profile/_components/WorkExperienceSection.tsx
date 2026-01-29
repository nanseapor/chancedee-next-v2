"use client";

import { Pencil, Briefcase } from "lucide-react";
import { workHistory } from "@/types/candidate.types";
import { Button } from "@/components/ui/button";

interface WorkExperienceSectionProps {
  works: workHistory[];
  onEdit: () => void;
}

/**
 * CAND-R02 Batch 3C: Work Experience Section
 *
 * Timeline display of work history with edit button.
 */
export function WorkExperienceSection({
  works,
  onEdit,
}: WorkExperienceSectionProps) {
  const formatDuration = (work: workHistory) => {
    if (!work.startYear) return "-";

    const startPart = work.startMonth
      ? `${String(work.startMonth).padStart(2, "0")}/${work.startYear}`
      : `${work.startYear}`;

    if (work.isCurrent) {
      return `${startPart} - ปัจจุบัน`;
    }

    if (work.endYear) {
      const endPart = work.endMonth
        ? `${String(work.endMonth).padStart(2, "0")}/${work.endYear}`
        : `${work.endYear}`;
      return `${startPart} - ${endPart}`;
    }

    return startPart;
  };

  const calculateYearsMonths = (work: workHistory) => {
    if (!work.startYear) return "-";
    const start = new Date(work.startYear, (work.startMonth || 1) - 1);
    const end = work.isCurrent
      ? new Date()
      : work.endYear
      ? new Date(work.endYear, (work.endMonth || 1) - 1)
      : new Date();

    // Boundary: reject if start is after end or duration exceeds 80 years
    if (start > end) return "-";

    const diffMs = end.getTime() - start.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;

    if (years > 80) return "-";

    if (years === 0) {
      return `${months} เดือน`;
    } else if (months === 0) {
      return `${years} ปี`;
    } else {
      return `${years} ปี ${months} เดือน`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">ประสบการณ์ทำงาน</h2>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="default"
          className="text-secondary-600 hover:text-secondary-700 gap-2"
        >
          <Pencil className="w-4 h-4" />
          แก้ไข
        </Button>
      </div>

      {/* Work Entries */}
      {works.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 italic mb-2">ยังไม่มีประสบการณ์ทำงาน</p>
          <p className="text-sm text-gray-400">คลิกแก้ไขเพื่อเพิ่มประสบการณ์</p>
        </div>
      ) : (
        <div className="space-y-6">
          {works.map((work, index) => (
            <div
              key={work.id || index}
              data-testid={`work-exp-${work.id || index}`}
              className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-0"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary-500 border-4 border-white"></div>

              {/* Work details */}
              <div>
                <h3 className="font-semibold text-gray-900">{work.jobTitle}</h3>
                <p className="text-sm text-gray-600 mb-1">{work.company}</p>
                <p className="text-xs text-gray-500 mb-2">
                  {formatDuration(work)} ({calculateYearsMonths(work)})
                </p>
                {work.note && (
                  <p className="text-sm text-gray-600 mt-2">{work.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
