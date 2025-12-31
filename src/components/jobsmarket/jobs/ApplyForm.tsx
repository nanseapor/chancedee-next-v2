/**
 * Apply Form Component
 *
 * Form fields for job application
 * Based on JOB-R02b RIS Section 3.2-3.4
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AVAILABILITY_OPTIONS, DEFAULT_APPLY_FORM, VALIDATION_LIMITS } from '@/lib/constants/jobsmarket/apply-modal';
import type { ApplyFormData, ApplyFormErrors } from '@/types/jobsmarket/apply-modal.types';

interface ApplyFormProps {
  onSubmit: (data: ApplyFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<ApplyFormData>;
}

/**
 * Apply Form
 *
 * Collects application data:
 * - Expected salary (optional)
 * - Negotiable checkbox
 * - Availability/overhead days
 * - Cover letter/headlines (optional)
 */
export function ApplyForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: ApplyFormProps) {
  const [formData, setFormData] = useState<ApplyFormData>({
    ...DEFAULT_APPLY_FORM,
    ...initialData,
  });
  const [errors, setErrors] = useState<ApplyFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ApplyFormErrors = {};

    // Salary validation (optional, but if provided must be valid)
    if (formData.expectedSalary !== null) {
      if (formData.expectedSalary < VALIDATION_LIMITS.SALARY_MIN) {
        newErrors.expectedSalary = 'เงินเดือนต้องมากกว่า 0';
      }
      if (formData.expectedSalary > VALIDATION_LIMITS.SALARY_MAX) {
        newErrors.expectedSalary = 'เงินเดือนสูงเกินไป';
      }
    }

    // Headlines validation
    if (formData.headlines.length > VALIDATION_LIMITS.HEADLINES_MAX_LENGTH) {
      newErrors.headlines = `ข้อความยาวเกินไป (สูงสุด ${VALIDATION_LIMITS.HEADLINES_MAX_LENGTH} ตัวอักษร)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleSalaryChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, expectedSalary: numValue }));
    // Clear error when user types
    if (errors.expectedSalary) {
      setErrors((prev) => ({ ...prev, expectedSalary: undefined }));
    }
  };

  const handleHeadlinesChange = (value: string) => {
    setFormData((prev) => ({ ...prev, headlines: value }));
    // Clear error when user types
    if (errors.headlines) {
      setErrors((prev) => ({ ...prev, headlines: undefined }));
    }
  };

  const remainingChars = VALIDATION_LIMITS.HEADLINES_MAX_LENGTH - formData.headlines.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Expected Salary */}
      <div className="space-y-2">
        <Label htmlFor="expectedSalary">
          เงินเดือนที่คาดหวัง <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span>
        </Label>
        <Input
          id="expectedSalary"
          type="number"
          placeholder="เช่น 30000"
          value={formData.expectedSalary ?? ''}
          onChange={(e) => handleSalaryChange(e.target.value)}
          disabled={isSubmitting}
          min={0}
          max={VALIDATION_LIMITS.SALARY_MAX}
          className={errors.expectedSalary ? 'border-red-500' : ''}
        />
        {errors.expectedSalary && (
          <p className="text-sm text-red-500">{errors.expectedSalary}</p>
        )}
      </div>

      {/* Negotiable Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isNegotiable"
          checked={formData.isNegotiable}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isNegotiable: checked as boolean }))
          }
          disabled={isSubmitting}
        />
        <label
          htmlFor="isNegotiable"
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          ต่อรองได้
        </label>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <Label htmlFor="overheadDays">สามารถเริ่มงานได้</Label>
        <Select
          value={formData.overheadDays.toString()}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, overheadDays: parseInt(value, 10) }))
          }
          disabled={isSubmitting}
        >
          <SelectTrigger id="overheadDays">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABILITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.labelThai}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cover Letter / Headlines */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="headlines">
            แนะนำตัวเอง <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span>
          </Label>
          <span
            className={`text-xs ${
              remainingChars < 0 ? 'text-red-500' : 'text-muted-foreground'
            }`}
          >
            {formData.headlines.length}/{VALIDATION_LIMITS.HEADLINES_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="headlines"
          placeholder="บอกเล่าสั้นๆ ว่าทำไมคุณเหมาะกับตำแหน่งนี้..."
          value={formData.headlines}
          onChange={(e) => handleHeadlinesChange(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          className={errors.headlines ? 'border-red-500' : ''}
        />
        {errors.headlines && (
          <p className="text-sm text-red-500">{errors.headlines}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งใบสมัคร'}
        </Button>
      </div>
    </form>
  );
}
