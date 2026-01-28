"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableTextField } from './fields/EditableTextField';
import { EditableSalaryRange } from './fields/EditableSalaryRange';
import { EditableSelect } from './fields/EditableSelect';
import { EditableNumberInput } from './fields/EditableNumberInput';
import type { FirebaseJobData } from '@/types/job.types';

interface EditableJobFormProps {
  formData: Partial<FirebaseJobData>;
  changedFields: Set<string>;
  validationErrors: Array<{ field: string; message: string }>;
  setField: (field: keyof FirebaseJobData, value: unknown) => void;
}

// Type-safe helper to get string value with default
function getString(data: Partial<FirebaseJobData>, field: keyof FirebaseJobData): string {
  const value = data[field];
  return typeof value === 'string' ? value : '';
}

// Type-safe helper to get number value
function getNumber(data: Partial<FirebaseJobData>, field: keyof FirebaseJobData): number | undefined {
  const value = data[field];
  return typeof value === 'number' ? value : undefined;
}

// Option lists for select fields
const EMPLOYMENT_OPTIONS = [
  { value: 'full-time', label: 'เต็มเวลา' },
  { value: 'part-time', label: 'พาร์ทไทม์' },
  { value: 'contract', label: 'สัญญาจ้าง' },
  { value: 'internship', label: 'ฝึกงาน' },
  { value: 'freelance', label: 'ฟรีแลนซ์' },
];

const JOB_TYPE_OPTIONS = [
  { value: 'onsite', label: 'ทำงานที่ออฟฟิศ' },
  { value: 'remote', label: 'ทำงานทางไกล' },
  { value: 'hybrid', label: 'ไฮบริด' },
];

export function EditableJobForm({
  formData,
  changedFields,
  validationErrors,
  setField,
}: EditableJobFormProps) {
  const getError = (field: string) => {
    return validationErrors.find((e) => e.field === field)?.message;
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EditableTextField
            label="ชื่อตำแหน่งงาน"
            name="title"
            value={getString(formData, 'title')}
            onChange={(value) => setField('title', value)}
            isChanged={changedFields.has('title')}
            error={getError('title')}
            required
            placeholder="เช่น Software Engineer"
            maxLength={100}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EditableSelect
              label="ประเภทการจ้างงาน"
              name="employment"
              value={getString(formData, 'employment')}
              options={EMPLOYMENT_OPTIONS}
              onChange={(value) => setField('employment', value)}
              isChanged={changedFields.has('employment')}
              error={getError('employment')}
            />

            <EditableSelect
              label="รูปแบบการทำงาน"
              name="jobType"
              value={getString(formData, 'jobType')}
              options={JOB_TYPE_OPTIONS}
              onChange={(value) => setField('jobType', value)}
              isChanged={changedFields.has('jobType')}
              error={getError('jobType')}
            />

            <EditableNumberInput
              label="จำนวนตำแหน่ง"
              name="positions"
              value={getNumber(formData, 'positions')}
              onChange={(value) => setField('positions', value)}
              isChanged={changedFields.has('positions')}
              error={getError('positions')}
              min={1}
              max={100}
              required
            />
          </div>

          <EditableTextField
            label="สถานที่ทำงาน"
            name="workLocation"
            value={getString(formData, 'workLocation')}
            onChange={(value) => setField('workLocation', value)}
            isChanged={changedFields.has('workLocation')}
            error={getError('workLocation')}
            placeholder="เช่น กรุงเทพมหานคร, สีลม"
          />

          <EditableTextField
            label="รายละเอียดงาน"
            name="jobDescriptionDetails"
            value={getString(formData, 'jobDescriptionDetails')}
            onChange={(value) => setField('jobDescriptionDetails', value)}
            isChanged={changedFields.has('jobDescriptionDetails')}
            error={getError('jobDescriptionDetails')}
            multiline
            rows={6}
            placeholder="อธิบายรายละเอียดของงาน หน้าที่ความรับผิดชอบ..."
          />

          <EditableTextField
            label="คุณสมบัติ"
            name="qualificationDetails"
            value={getString(formData, 'qualificationDetails')}
            onChange={(value) => setField('qualificationDetails', value)}
            isChanged={changedFields.has('qualificationDetails')}
            error={getError('qualificationDetails')}
            multiline
            rows={4}
            placeholder="ระบุคุณสมบัติที่ต้องการ..."
          />
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <CardTitle>ค่าตอบแทน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EditableSalaryRange
            minValue={getNumber(formData, 'minSalary')}
            maxValue={getNumber(formData, 'maxSalary')}
            onMinChange={(value) => setField('minSalary', value)}
            onMaxChange={(value) => setField('maxSalary', value)}
            isMinChanged={changedFields.has('minSalary')}
            isMaxChanged={changedFields.has('maxSalary')}
            error={getError('minSalary') || getError('maxSalary')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
