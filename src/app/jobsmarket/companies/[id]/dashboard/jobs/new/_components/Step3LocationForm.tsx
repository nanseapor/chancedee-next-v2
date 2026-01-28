"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LocationSelect,
  type WorkModel,
} from "@/components/jobsmarket/jobs/forms/LocationSelect";
import type { JobFormData } from "@/types/jobsmarket/job-wizard.types";

export interface Step3LocationFormProps {
  formData: Partial<JobFormData>;
  errors: Record<string, string>;
  onFieldChange: (field: keyof JobFormData, value: any) => void;
}

/**
 * Step 3: Work Location Form
 * Work model (onsite/hybrid/remote) and location details
 */
export function Step3LocationForm({
  formData,
  errors,
  onFieldChange,
}: Step3LocationFormProps) {
  return (
    <div className="space-y-6">
      {/* Location Select (Work Model + Province/District) */}
      <LocationSelect
        workModel={formData.workModel as WorkModel}
        provinceId={formData.provinceId}
        districtId={formData.districtId}
        onWorkModelChange={(model) => {
          onFieldChange("workModel", model);
          // Clear location fields if switching to remote
          if (model === "remote") {
            onFieldChange("provinceId", undefined);
            onFieldChange("province", undefined);
            onFieldChange("districtId", undefined);
            onFieldChange("district", undefined);
          }
        }}
        onProvinceChange={(id, name) => {
          onFieldChange("provinceId", id);
          onFieldChange("province", name);
          // Clear district when province changes
          onFieldChange("districtId", undefined);
          onFieldChange("district", undefined);
        }}
        onDistrictChange={(id, name) => {
          onFieldChange("districtId", id);
          onFieldChange("district", name);
        }}
        errors={{
          workModel: errors.workModel,
          province: errors.province,
          district: errors.district,
        }}
      />

      {/* Full Address (Optional) */}
      {formData.workModel && formData.workModel !== "remote" && (
        <div className="space-y-2">
          <Label htmlFor="fullAddress">
            ที่อยู่สำนักงาน{" "}
            <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
          </Label>
          <Textarea
            id="fullAddress"
            value={formData.fullAddress || ""}
            onChange={(e) => onFieldChange("fullAddress", e.target.value)}
            placeholder="เช่น 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
            rows={3}
          />
          <p className="text-xs text-gray-500">
            ระบุที่อยู่สำนักงานเพื่อให้ผู้สมัครทราบตำแหน่งที่ตั้ง
          </p>
        </div>
      )}

      {/* Remote Work Info */}
      {formData.workModel === "remote" && (
        <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4">
          <p className="text-sm text-secondary-700">
            <strong>ทำงานจากที่บ้าน 100%</strong>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            ผู้สมัครสามารถทำงานจากที่ใดก็ได้ โดยไม่ต้องเข้าออฟฟิศ
          </p>
        </div>
      )}

      {/* Hybrid Work Info */}
      {formData.workModel === "hybrid" && (
        <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-4">
          <p className="text-sm text-secondary-700">
            <strong>ทำงานแบบผสมผสาน (Hybrid)</strong>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            ผู้สมัครสามารถทำงานจากที่บ้านได้บางวัน และเข้าออฟฟิศบางวัน
          </p>
        </div>
      )}
    </div>
  );
}
