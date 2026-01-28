"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit2, MapPin, Briefcase, DollarSign, Users } from "lucide-react";
import type { JobFormData, WizardStep } from "@/types/jobsmarket/job-wizard.types";

export interface Step4ReviewProps {
  formData: Partial<JobFormData>;
  onEdit: (step: WizardStep) => void;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  fulltime: "งานประจำ",
  parttime: "งานพาร์ทไทม์",
  contract: "งานสัญญาจ้าง",
  internship: "งานฝึกงาน",
};

const WORK_MODEL_LABELS: Record<string, string> = {
  onsite: "ทำงานที่สำนักงาน",
  hybrid: "ทำงานแบบผสมผสาน",
  remote: "ทำงานจากที่บ้าน",
};

/**
 * Step 4: Review & Publish
 * Shows preview of all form data with edit links
 */
export function Step4Review({ formData, onEdit }: Step4ReviewProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "ไม่ระบุ";
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} บาท/เดือน`;
    if (min) return `${min.toLocaleString()}+ บาท/เดือน`;
    if (max) return `สูงสุด ${max.toLocaleString()} บาท/เดือน`;
    return "ไม่ระบุ";
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">ข้อมูลพื้นฐาน</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {formData.title || "ไม่ระบุชื่อตำแหน่ง"}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">ประเภทงาน</p>
              <p className="font-medium">
                {formData.jobType ? JOB_TYPE_LABELS[formData.jobType] : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ระดับ</p>
              <p className="font-medium capitalize">{formData.jobLevel || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">จำนวนตำแหน่ง</p>
              <p className="font-medium">{formData.numberOfPosition || 1} ตำแหน่ง</p>
            </div>
            {formData.department && (
              <div>
                <p className="text-sm text-gray-500">แผนก/ฝ่าย</p>
                <p className="font-medium">{formData.department}</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-500">เงินเดือน</p>
            </div>
            <p className="mt-1 font-medium">
              {formData.hideSalary
                ? "ไม่แสดงเงินเดือน"
                : formatSalary(formData.minSalary, formData.maxSalary)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">รายละเอียดงาน</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              รายละเอียดงาน
            </p>
            {formData.jobDescriptionDetails ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formData.jobDescriptionDetails,
                }}
              />
            ) : (
              <p className="text-gray-500">ไม่ได้ระบุ</p>
            )}
          </div>

          {/* Responsibilities */}
          {formData.jobResponsibilitiesDetails && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                ความรับผิดชอบหลัก
              </p>
              <pre className="whitespace-pre-wrap text-sm text-gray-600">
                {formData.jobResponsibilitiesDetails}
              </pre>
            </div>
          )}

          {/* Requirements */}
          {formData.jobRequirementsDetails && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                คุณสมบัติที่ต้องการ
              </p>
              <pre className="whitespace-pre-wrap text-sm text-gray-600">
                {formData.jobRequirementsDetails}
              </pre>
            </div>
          )}

          {/* Skills */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              ทักษะที่ต้องการ
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.skills && formData.skills.length > 0 ? (
                formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">ไม่ได้ระบุทักษะ</p>
              )}
            </div>
          </div>

          {/* Benefits */}
          {formData.benefits && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                สวัสดิการและผลประโยชน์
              </p>
              <pre className="whitespace-pre-wrap text-sm text-gray-600">
                {formData.benefits}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Location */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">สถานที่ทำงาน</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            แก้ไข
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Briefcase className="mt-1 h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">รูปแบบการทำงาน</p>
              <p className="font-medium">
                {formData.workModel
                  ? WORK_MODEL_LABELS[formData.workModel]
                  : "ไม่ได้ระบุ"}
              </p>
            </div>
          </div>

          {formData.workModel !== "remote" && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">สถานที่</p>
                <p className="font-medium">
                  {formData.province || "ไม่ได้ระบุ"}
                  {formData.district && `, ${formData.district}`}
                </p>
                {formData.fullAddress && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formData.fullAddress}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Info Box */}
      <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4">
        <div className="flex items-start gap-3">
          <Users className="mt-1 h-5 w-5 text-secondary-600" />
          <div>
            <p className="font-medium text-secondary-900">
              พร้อมเผยแพร่ประกาศงานแล้ว
            </p>
            <p className="mt-1 text-sm text-gray-600">
              ตรวจสอบข้อมูลให้ถูกต้องแล้วคลิก "เผยแพร่" ด้านล่างเพื่อเผยแพร่ประกาศงาน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
