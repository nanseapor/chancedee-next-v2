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
  Step4Skills,
  type Step4FormData,
} from "@/app/jobsmarket/candidates/profile/create/_components/Step4Skills";
import { useToast } from "@/hooks/use-toast-notification";
import type { FirebaseCandidateData } from "@/types/candidate.types";
import { webCandidateSaveSkills } from "@/lib/database/actions/candidate-information";

interface SkillsEditDrawerProps {
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
 * CAND-R02 Batch 3D: Skills Edit Drawer
 *
 * Allows editing skills and languages in a slide-in drawer.
 * Reuses Step4Skills form logic from wizard.
 */
export function SkillsEditDrawer({
  open,
  onOpenChange,
  candidate,
  onSaved,
}: SkillsEditDrawerProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  // Convert candidate data to Step4 format
  const initialData: Partial<Step4FormData> = React.useMemo(
    () => ({
      skills: candidate.skills?.map(s => s.skillName) || [],
      languages: candidate.languages?.map(l => ({
        name: l.languageName || "",
        level: l.languageLevel || "",
      })) || [],
    }),
    [candidate]
  );

  // Handle form submission
  async function handleSubmit(data: Step4FormData) {
    setIsLoading(true);

    try {
      // Transform Step4FormData to server action format
      const transformedData = {
        skills: data.skills.map(skillName => ({
          name: skillName,
        })),
        languages: data.languages.map(lang => ({
          name: lang.name,
          level: lang.level,
        })),
      };

      // Save to Firestore
      await webCandidateSaveSkills(candidate.uid, transformedData, candidate.uid);

      addToast("บันทึกทักษะและภาษาสำเร็จ", "success");
      setIsDirty(false);

      // Call onSaved callback
      onSaved?.();

      // Close drawer
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving skills:", error);
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
              <SheetTitle>แก้ไขทักษะและภาษา</SheetTitle>
              <SheetDescription>
                เพิ่ม แก้ไข หรือลบทักษะและภาษาที่คุณสามารถใช้ได้
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
          <Step4Skills
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
