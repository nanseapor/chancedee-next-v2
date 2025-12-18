"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Step3Education,
  type Step3FormData,
} from "@/app/jobsmarket/candidates/profile/create/_components/Step3Education";
import { useToast } from "@/hooks/use-toast-notification";
import type { FirebaseCandidateData } from "@/types/candidate.types";
import { webCandidateSaveEducation } from "@/lib/database/actions/candidate-information";
import { EDUCATION_LEVELS } from "@/lib/constants/jobsmarket/education";

interface EducationEditDrawerProps {
  /** Is drawer open */
  open: boolean;
  /** Callback to close drawer */
  onOpenChange: (open: boolean) => void;
  /** Current candidate data */
  candidate: FirebaseCandidateData;
  /** Callback after successful save */
  onSaved?: () => void;
}

/**
 * CAND-R02 Batch 3D: Education Edit Drawer
 *
 * Allows editing education history in a slide-in drawer.
 * Reuses Step3Education form logic from wizard.
 */
export function EducationEditDrawer({
  open,
  onOpenChange,
  candidate,
  onSaved,
}: EducationEditDrawerProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  // Convert candidate data to Step3 format
  // Step3 expects a single education object (highest level)
  // We'll use the first education entry if available
  const initialData: Partial<Step3FormData> = React.useMemo(
    () => {
      const firstEducation = candidate.educations?.[0];
      if (!firstEducation) {
        return {};
      }
      return {
        education: {
          level: firstEducation.educationLabel || "",
          institution: firstEducation.institution || "",
          faculty: firstEducation.major || "",
          graduation_year: firstEducation.endYear || new Date().getFullYear(),
          gpa: firstEducation.gpax ? parseFloat(firstEducation.gpax) : undefined,
        },
      };
    },
    [candidate]
  );

  // Handle form submission
  async function handleSubmit(data: Step3FormData) {
    setIsLoading(true);

    try {
      // Map education level string to number
      const levelMap: Record<string, number> = {
        'below_bachelor': 0,
        'bachelor': 1,
        'master': 2,
        'doctorate': 3,
      };

      // Find the education level entry
      const levelEntry = EDUCATION_LEVELS.find(
        level => level.label === data.education.level
      );
      const levelNumber = levelEntry ? levelMap[levelEntry.value] ?? 0 : 0;

      // Transform Step3FormData to server action format
      const transformedEducations = [{
        institution: data.education.institution,
        level: levelNumber,
        level_label: data.education.level,
        faculty: data.education.faculty,
        end_year: data.education.graduation_year,
        gpa: data.education.gpa?.toString(),
      }];

      // Save to Firestore
      await webCandidateSaveEducation(candidate.uid, transformedEducations, candidate.uid);

      addToast("บันทึกประวัติการศึกษาสำเร็จ", "success");
      setIsDirty(false);

      // Call onSaved callback
      onSaved?.();

      // Close drawer
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving education:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle close with dirty check
  function handleClose() {
    if (isDirty) {
      const confirmed = window.confirm(
        "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่?"
      );
      if (!confirmed) return;
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {/* Header */}
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>แก้ไขประวัติการศึกษา</SheetTitle>
              <SheetDescription>
                เพิ่ม แก้ไข หรือลบประวัติการศึกษาของคุณ
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="mt-6">
          <Step3Education
            initialData={initialData}
            onSubmit={handleSubmit}
            showBackButton={false}
            submitText="บันทึก"
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
