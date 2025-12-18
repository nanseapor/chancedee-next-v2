"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil } from "lucide-react";

/**
 * Work Experience Entry Schema
 * Based on CAND-R02 RIS Section 8.2
 */
const workExperienceSchema = z.object({
  company: z.string().min(1, "กรุณากรอกชื่อบริษัท").max(200, "ชื่อบริษัทยาวเกินไป"),
  position: z.string().min(1, "กรุณากรอกตำแหน่ง").max(200, "ตำแหน่งยาวเกินไป"),
  start_year: z.number().min(1950, "ปีไม่ถูกต้อง").max(new Date().getFullYear(), "ปีไม่ถูกต้อง"),
  end_year: z.number().optional(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (data.is_current) return true; // No end_year validation if current job
    if (!data.end_year) return false;
    return data.end_year >= data.start_year;
  },
  {
    message: "ปีสิ้นสุดต้องมากกว่าหรือเท่ากับปีเริ่มต้น",
    path: ["end_year"],
  }
);

/**
 * Step 2 Schema
 * Requires EITHER works array (≥1) OR is_fresh_graduate flag
 */
const step2Schema = z.object({
  works: z.array(workExperienceSchema),
  is_fresh_graduate: z.boolean().default(false),
}).refine(
  (data) => data.works.length > 0 || data.is_fresh_graduate,
  {
    message: "กรุณาเพิ่มประสบการณ์ หรือเลือกนักศึกษาจบใหม่",
    path: ["works"],
  }
);

export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type Step2FormData = z.infer<typeof step2Schema>;

export interface Step2WorkExperienceProps {
  /** Initial form data (for draft resume) */
  initialData?: Partial<Step2FormData>;
  /** Callback when form is submitted */
  onSubmit: (data: Step2FormData) => void | Promise<void>;
  /** Callback to go back */
  onBack?: () => void;
  /** Show back button */
  showBackButton?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Step 2: Work Experience Form
 *
 * Used in CAND-R02 Profile Creation Wizard
 * Collects work experience or fresh graduate status
 *
 * Features:
 * - Work experience array CRUD
 * - Fresh graduate toggle
 * - Current job checkbox (only one can be current)
 * - Start/end year validation
 */
export function Step2WorkExperience({
  initialData,
  onSubmit,
  onBack,
  showBackButton = true,
  submitText = "ถัดไป",
  isLoading = false,
}: Step2WorkExperienceProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      works: initialData?.works || [],
      is_fresh_graduate: initialData?.is_fresh_graduate || false,
    },
  });

  const works = watch("works") || [];
  const isFreshGraduate = watch("is_fresh_graduate");

  // Work entry being edited
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = React.useState(false);

  // Fresh graduate confirm dialog
  const [showFreshGradConfirm, setShowFreshGradConfirm] = React.useState(false);
  const [pendingFreshGradValue, setPendingFreshGradValue] = React.useState(false);

  // Work entry form state
  const [workFormData, setWorkFormData] = React.useState<Partial<WorkExperience>>({
    company: "",
    position: "",
    start_year: new Date().getFullYear(),
    end_year: undefined,
    is_current: false,
    description: "",
  });
  const [workFormErrors, setWorkFormErrors] = React.useState<Record<string, string>>({});

  // Generate year options (1950 - current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  // Handle fresh graduate toggle
  const handleFreshGraduateToggle = (checked: boolean) => {
    if (checked && works.length > 0) {
      // Show confirmation dialog
      setPendingFreshGradValue(true);
      setShowFreshGradConfirm(true);
    } else {
      setValue("is_fresh_graduate", checked);
    }
  };

  // Confirm fresh graduate toggle (clear works)
  const confirmFreshGraduate = () => {
    setValue("works", []);
    setValue("is_fresh_graduate", true);
    setShowFreshGradConfirm(false);
  };

  // Add new work entry
  const handleAddWork = () => {
    setWorkFormData({
      company: "",
      position: "",
      start_year: currentYear,
      end_year: undefined,
      is_current: false,
      description: "",
    });
    setWorkFormErrors({});
    setIsAddingNew(true);
  };

  // Edit existing work entry
  const handleEditWork = (index: number) => {
    const work = works[index];
    if (work) {
      setWorkFormData(work);
      setWorkFormErrors({});
      setEditingIndex(index);
    }
  };

  // Delete work entry
  const handleDeleteWork = (index: number) => {
    const newWorks = works.filter((_, i) => i !== index);
    setValue("works", newWorks);
  };

  // Save work entry (add or update)
  const handleSaveWork = () => {
    // Validate work entry
    try {
      const validated = workExperienceSchema.parse(workFormData);

      // Ensure only one current job
      let newWorks = [...works];
      if (validated.is_current) {
        newWorks = newWorks.map((w, i) =>
          i === editingIndex ? w : { ...w, is_current: false }
        );
      }

      if (isAddingNew) {
        // Add new entry
        newWorks.push(validated);

        // Auto-disable fresh graduate if adding work
        if (isFreshGraduate) {
          setValue("is_fresh_graduate", false);
        }
      } else if (editingIndex !== null) {
        // Update existing entry
        newWorks[editingIndex] = validated;
      }

      setValue("works", newWorks);
      setIsAddingNew(false);
      setEditingIndex(null);
      setWorkFormErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setWorkFormErrors(fieldErrors);
      }
    }
  };

  // Cancel work entry form
  const handleCancelWork = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    setWorkFormErrors({});
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">ประสบการณ์ทำงาน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          เพิ่มประสบการณ์การทำงานของคุณ หรือเลือก "นักศึกษาจบใหม่" หากยังไม่มีประสบการณ์
        </p>
      </div>

      {/* Fresh Graduate Toggle */}
      <div className="flex items-center space-x-2 rounded-md border p-4">
        <Checkbox
          id="is_fresh_graduate"
          checked={isFreshGraduate}
          onCheckedChange={handleFreshGraduateToggle}
          disabled={isLoading || isAddingNew || editingIndex !== null}
        />
        <Label
          htmlFor="is_fresh_graduate"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          ฉันเป็นนักศึกษาจบใหม่ (ยังไม่มีประสบการณ์ทำงาน)
        </Label>
      </div>

      {/* Fresh Graduate Confirmation Dialog */}
      <Dialog open={showFreshGradConfirm} onOpenChange={setShowFreshGradConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการเปลี่ยนแปลง</DialogTitle>
            <DialogDescription>
              การเปลี่ยนเป็น "นักศึกษาจบใหม่" จะลบประสบการณ์ทำงานทั้งหมดที่คุณกรอกไว้
              คุณแน่ใจหรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFreshGradConfirm(false)}
            >
              ยกเลิก
            </Button>
            <Button type="button" onClick={confirmFreshGraduate}>
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Experiences List */}
      {!isFreshGraduate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">ประวัติการทำงาน</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddWork}
              disabled={isAddingNew || editingIndex !== null || works.length >= 20}
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มประสบการณ์
            </Button>
          </div>

          {/* Work Entries */}
          {works.map((work, index) => (
            <div
              key={index}
              className="rounded-md border p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{work.position}</p>
                  <p className="text-sm text-muted-foreground">{work.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {work.start_year} - {work.is_current ? "ปัจจุบัน" : work.end_year}
                    {work.is_current && <span className="ml-2 text-primary">(ตำแหน่งปัจจุบัน)</span>}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditWork(index)}
                    disabled={isAddingNew || editingIndex !== null}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWork(index)}
                    disabled={isAddingNew || editingIndex !== null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Work Entry Form (Add/Edit) */}
          {(isAddingNew || editingIndex !== null) && (
            <div className="rounded-md border p-4 space-y-4 bg-muted/50">
              <h4 className="font-medium">
                {isAddingNew ? "เพิ่มประสบการณ์ใหม่" : "แก้ไขประสบการณ์"}
              </h4>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="work_company">
                  ชื่อบริษัท <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="work_company"
                  placeholder="บริษัท ABC จำกัด"
                  value={workFormData.company || ""}
                  onChange={(e) => setWorkFormData({ ...workFormData, company: e.target.value })}
                />
                {workFormErrors.company && (
                  <p className="text-xs text-destructive">{workFormErrors.company}</p>
                )}
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="work_position">
                  ตำแหน่ง <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="work_position"
                  placeholder="Software Engineer"
                  value={workFormData.position || ""}
                  onChange={(e) => setWorkFormData({ ...workFormData, position: e.target.value })}
                />
                {workFormErrors.position && (
                  <p className="text-xs text-destructive">{workFormErrors.position}</p>
                )}
              </div>

              {/* Start Year */}
              <div className="space-y-2">
                <Label htmlFor="work_start_year">
                  ปีที่เริ่มงาน <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={workFormData.start_year?.toString()}
                  onValueChange={(value) => setWorkFormData({ ...workFormData, start_year: parseInt(value) })}
                >
                  <SelectTrigger id="work_start_year">
                    <SelectValue placeholder="เลือกปี" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {workFormErrors.start_year && (
                  <p className="text-xs text-destructive">{workFormErrors.start_year}</p>
                )}
              </div>

              {/* Current Job */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="work_is_current"
                  checked={workFormData.is_current || false}
                  onCheckedChange={(checked) => {
                    setWorkFormData({
                      ...workFormData,
                      is_current: checked as boolean,
                      end_year: checked ? undefined : workFormData.end_year,
                    });
                  }}
                />
                <Label
                  htmlFor="work_is_current"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  ยังทำงานอยู่ในตำแหน่งนี้
                </Label>
              </div>

              {/* End Year (if not current) */}
              {!workFormData.is_current && (
                <div className="space-y-2">
                  <Label htmlFor="work_end_year">
                    ปีที่สิ้นสุด <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={workFormData.end_year?.toString() || ""}
                    onValueChange={(value) => setWorkFormData({ ...workFormData, end_year: parseInt(value) })}
                  >
                    <SelectTrigger id="work_end_year">
                      <SelectValue placeholder="เลือกปี" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {workFormErrors.end_year && (
                    <p className="text-xs text-destructive">{workFormErrors.end_year}</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="work_description">รายละเอียดงาน (ถ้ามี)</Label>
                <Textarea
                  id="work_description"
                  placeholder="บรรยายหน้าที่ความรับผิดชอบ..."
                  value={workFormData.description || ""}
                  onChange={(e) => setWorkFormData({ ...workFormData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancelWork}>
                  ยกเลิก
                </Button>
                <Button type="button" onClick={handleSaveWork}>
                  บันทึก
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {works.length === 0 && !isAddingNew && !isFreshGraduate && (
            <div className="text-center py-8 text-muted-foreground">
              <p>ยังไม่มีประสบการณ์ทำงาน</p>
              <p className="text-sm">คลิก "เพิ่มประสบการณ์" เพื่อเพิ่มข้อมูล</p>
            </div>
          )}

          {/* Validation Error */}
          {errors.works && !isFreshGraduate && works.length === 0 && (
            <p className="text-xs text-destructive">{errors.works.message}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        {showBackButton && onBack ? (
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            ย้อนกลับ
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="submit"
          disabled={isLoading || isAddingNew || editingIndex !== null}
        >
          {isLoading ? "กำลังบันทึก..." : submitText}
        </Button>
      </div>
    </form>
  );
}
