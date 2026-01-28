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
  Step5JobPreferences,
  type Step5FormData,
} from "@/app/jobsmarket/(onboarding)/candidates/profile/create/_components/Step5JobPreferences";
import { useToast } from "@/hooks/use-toast-notification";
import type { FirebaseCandidateData } from "@/types/candidate.types";
import { webCandidateSavePreferences } from "@/lib/database/actions/candidate-preference";

interface JobPreferencesEditDrawerProps {
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
 * CAND-R02 Batch 3D: Job Preferences Edit Drawer
 *
 * Allows editing job preferences in a slide-in drawer.
 * Reuses Step5JobPreferences form logic from wizard.
 */
export function JobPreferencesEditDrawer({
  open,
  onOpenChange,
  candidate,
  onSaved,
}: JobPreferencesEditDrawerProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  // Convert candidate data to Step5 format
  // Note: Job preferences are in a separate collection, may need to fetch
  const initialData: Partial<Step5FormData> = React.useMemo(
    () => ({
      // TODO: Fetch from candidate_preference collection
      // For now, use empty object
    }),
    [candidate]
  );

  // Handle form submission
  async function handleSubmit(data: Step5FormData) {
    setIsLoading(true);

    try {
      // Transform Step5FormData to server action format
      const transformedData = {
        job_types: data.job_types,
        positions: data.positions,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        is_negotiable: false, // Default value if not in Step5FormData
        locations: data.locations,
        availability: data.availability as 'immediately' | '2_weeks' | '1_month' | '2_months_plus',
      };

      // Save to Firestore
      await webCandidateSavePreferences(candidate.uid, transformedData, candidate.uid);

      addToast("บันทึกความต้องการงานสำเร็จ", "success");
      setIsDirty(false);

      // Call onSaved callback
      onSaved?.();

      // Close drawer
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving job preferences:", error);
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
              <SheetTitle>แก้ไขความต้องการงาน</SheetTitle>
              <SheetDescription>
                แก้ไขความต้องการงาน เงินเดือน และสถานที่ทำงานของคุณ
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
          <Step5JobPreferences
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
