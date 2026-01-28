"use client";

import { Pencil, GraduationCap } from "lucide-react";
import { educationHistory } from "@/types/candidate.types";
import { Button } from "@/components/ui/button";

interface EducationSectionProps {
  educations: educationHistory[];
  onEdit: () => void;
}

/**
 * CAND-R02 Batch 3C: Education Section
 *
 * List display of education entries with edit button.
 */
export function EducationSection({
  educations,
  onEdit,
}: EducationSectionProps) {
  const getEducationLevelLabel = (level: number): string => {
    const labels: Record<number, string> = {
      1: "มัธยมศึกษาตอนต้น",
      2: "มัธยมศึกษาตอนปลาย",
      3: "ปวช.",
      4: "ปวส.",
      5: "ปริญญาตรี",
      6: "ปริญญาโท",
      7: "ปริญญาเอก",
    };
    return labels[level] || "ไม่ระบุระดับ";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">ประวัติการศึกษา</h2>
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

      {/* Education Entries */}
      {educations.length === 0 ? (
        <div className="text-center py-8">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 italic mb-2">ยังไม่มีประวัติการศึกษา</p>
          <p className="text-sm text-gray-400">คลิกแก้ไขเพื่อเพิ่มประวัติการศึกษา</p>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((education, index) => (
            <div
              key={education.id || index}
              data-testid={`education-${education.id || index}`}
              className="border-l-4 border-blue-500 pl-4 py-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {education.educationLabel || getEducationLevelLabel(education.educationLevel)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {education.institution}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {[education.major, education.minor].filter(Boolean).join(" / ")}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs text-gray-500">
                      ปีที่จบ: {education.endYear}
                    </p>
                    {education.gpax && (
                      <p className="text-xs text-gray-500">
                        เกรดเฉลี่ย: {education.gpax}
                      </p>
                    )}
                  </div>
                  {education.highlights && (
                    <p className="text-sm text-gray-600 mt-2">
                      {education.highlights}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
