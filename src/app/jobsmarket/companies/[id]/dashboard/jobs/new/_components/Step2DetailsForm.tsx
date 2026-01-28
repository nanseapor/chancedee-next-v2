"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/jobsmarket/jobs/forms/RichTextEditor";
import { SkillsTagInput } from "@/components/jobsmarket/jobs/forms/SkillsTagInput";
import type { JobFormData } from "@/types/jobsmarket/job-wizard.types";

export interface Step2DetailsFormProps {
  formData: Partial<JobFormData>;
  errors: Record<string, string>;
  onFieldChange: (field: keyof JobFormData, value: any) => void;
}

/**
 * Step 2: Job Details Form
 * Job description (rich text), responsibilities, requirements, skills, benefits
 */
export function Step2DetailsForm({
  formData,
  errors,
  onFieldChange,
}: Step2DetailsFormProps) {
  return (
    <div className="space-y-6">
      {/* Job Description (Rich Text) */}
      <RichTextEditor
        label="รายละเอียดงาน"
        value={formData.jobDescriptionDetails || ""}
        onChange={(html, text) => {
          onFieldChange("jobDescriptionDetails", html);
          onFieldChange("jobDescriptionText", text);
        }}
        placeholder="อธิบายลักษณะงาน หน้าที่ความรับผิดชอบ และสิ่งที่ผู้สมัครจะได้ทำ..."
        minLength={50}
        error={errors.jobDescriptionDetails}
      />

      {/* Job Responsibilities (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="jobResponsibilities">
          ความรับผิดชอบหลัก{" "}
          <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
        </Label>
        <Textarea
          id="jobResponsibilities"
          value={formData.jobResponsibilitiesDetails || ""}
          onChange={(e) => {
            const value = e.target.value;
            onFieldChange("jobResponsibilitiesDetails", value);
            onFieldChange("jobResponsibilitiesText", value);
          }}
          placeholder="- พัฒนาและดูแลระบบ Frontend&#10;- ทำงานร่วมกับทีม Backend&#10;- Code Review และ Testing"
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          แนะนำให้ใช้ bullet points (- หรือ •) สำหรับความชัดเจน
        </p>
      </div>

      {/* Job Requirements (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="jobRequirements">
          คุณสมบัติที่ต้องการ{" "}
          <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
        </Label>
        <Textarea
          id="jobRequirements"
          value={formData.jobRequirementsDetails || ""}
          onChange={(e) => {
            const value = e.target.value;
            onFieldChange("jobRequirementsDetails", value);
            onFieldChange("jobRequirementsText", value);
          }}
          placeholder="- ปริญญาตรีสาขาที่เกี่ยวข้อง&#10;- ประสบการณ์ 2+ ปี&#10;- สามารถสื่อสารภาษาอังกฤษได้"
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          แนะนำให้ใช้ bullet points (- หรือ •) สำหรับความชัดเจน
        </p>
      </div>

      {/* Skills (Required) */}
      <SkillsTagInput
        label="ทักษะที่ต้องการ"
        value={formData.skills || []}
        onChange={(skills) => onFieldChange("skills", skills)}
        placeholder="พิมพ์ทักษะและกด Enter (เช่น React, TypeScript, Node.js)"
        error={errors.skills}
      />

      {/* Benefits (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="benefits">
          สวัสดิการและผลประโยชน์{" "}
          <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
        </Label>
        <Textarea
          id="benefits"
          value={formData.benefits || ""}
          onChange={(e) => onFieldChange("benefits", e.target.value)}
          placeholder="- ประกันสุขภาพ&#10;- โบนัสประจำปี&#10;- ทำงานจากที่บ้านได้&#10;- อบรมและพัฒนาทักษะ"
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          ระบุสวัสดิการและสิทธิประโยชน์ที่พนักงานจะได้รับ
        </p>
      </div>
    </div>
  );
}
