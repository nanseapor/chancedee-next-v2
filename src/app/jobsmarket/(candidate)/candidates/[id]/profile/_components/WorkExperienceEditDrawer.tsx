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
  Step2WorkExperience,
  type Step2FormData,
} from "@/app/jobsmarket/(onboarding)/candidates/profile/create/_components/Step2WorkExperience";
import { useToast } from "@/hooks/use-toast-notification";
import type { FirebaseCandidateData } from "@/types/candidate.types";
import { webCandidateSaveWorkExperience } from "@/lib/database/actions/candidate-information";

interface WorkExperienceEditDrawerProps {
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
 * CAND-R02 Batch 3D: Work Experience Edit Drawer
 *
 * Allows editing work experience in a slide-in drawer.
 * Reuses Step2WorkExperience form logic from wizard.
 */
export function WorkExperienceEditDrawer({
  open,
  onOpenChange,
  candidate,
  onSaved,
}: WorkExperienceEditDrawerProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  // Convert candidate data to Step2 format
  const initialData: Partial<Step2FormData> = React.useMemo(
    () => ({
      works: candidate.works?.map(w => ({
        company: w.company,
        position: w.jobTitle,
        start_year: w.startYear,
        end_year: w.endYear,
        is_current: w.isCurrent,
        description: w.note,
      })) || [],
      // Check if candidate is fresh graduate (no work experience)
      is_fresh_graduate: !candidate.works || candidate.works.length === 0,
    }),
    [candidate]
  );

  // Handle form submission
  async function handleSubmit(data: Step2FormData) {
    setIsLoading(true);

    try {
      // Transform Step2FormData to server action format
      const transformedWorks = data.works.map(work => ({
        company: work.company,
        position: work.position,
        start_month: 1, // Default to January if not specified
        start_year: work.start_year,
        end_month: work.is_current ? undefined : 12, // Default to December if not specified
        end_year: work.is_current ? undefined : work.end_year,
        is_current: work.is_current,
        note: work.description,
      }));

      // Save to Firestore
      await webCandidateSaveWorkExperience(candidate.uid, transformedWorks, candidate.uid);

      addToast("บันทึกประสบการณ์ทำงานสำเร็จ", "success");
      setIsDirty(false);

      // Call onSaved callback
      onSaved?.();

      // Close drawer
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving work experience:", error);
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
              <SheetTitle>แก้ไขประสบการณ์ทำงาน</SheetTitle>
              <SheetDescription>
                เพิ่ม แก้ไข หรือลบประสบการณ์ทำงานของคุณ
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
        <div className="mt-6 px-4">
          <Step2WorkExperience
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
