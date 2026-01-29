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
  Step1PersonalInfo,
  type Step1FormData,
} from "@/app/jobsmarket/(onboarding)/candidates/profile/create/_components/Step1PersonalInfo";
import { webCandidateSavePersonalInfo } from "@/lib/database/actions/candidate-information";
import { useToast } from "@/hooks/use-toast-notification";
import type { FirebaseCandidateData } from "@/types/candidate.types";

interface PersonalInfoEditDrawerProps {
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
 * CAND-R02 Batch 3D: Personal Info Edit Drawer
 *
 * Allows editing personal information in a slide-in drawer.
 * Reuses Step1PersonalInfo form logic from wizard.
 */
export function PersonalInfoEditDrawer({
  open,
  onOpenChange,
  candidate,
  onSaved,
}: PersonalInfoEditDrawerProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  // Convert candidate data to Step1 format
  const initialData: Partial<Step1FormData> = React.useMemo(
    () => ({
      title_prefix: candidate.titlePrefix || "",
      first_name_th: candidate.firstnameTH || "",
      last_name_th: candidate.lastnameTH || "",
      nick_name_th: candidate.nicknameTH || "",
      email: candidate.email || "",
      phone_number: candidate.phone || "",
      birthdate: candidate.birthdate
        ? new Date(candidate.birthdate * 1000).toISOString().split("T")[0]
        : "",
      gender: candidate.gender || "",
      marital_status: candidate.maritalStatus || "",
      province: candidate.province || "",
      district: candidate.district || "",
      address_line_1: candidate.addressLine1 || "",
      post_code: candidate.postCode || "",
    }),
    [candidate]
  );

  // Handle form submission
  async function handleSubmit(data: Step1FormData) {
    setIsLoading(true);

    try {
      // Save to Firestore
      await webCandidateSavePersonalInfo(candidate.uid, data, candidate.uid);

      addToast("บันทึกข้อมูลส่วนตัวสำเร็จ", "success");
      setIsDirty(false);

      // Call onSaved callback
      onSaved?.();

      // Close drawer
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving personal info:", error);
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
              <SheetTitle>แก้ไขข้อมูลส่วนตัว</SheetTitle>
              <SheetDescription>
                แก้ไขข้อมูลส่วนตัวของคุณ เพื่อให้นายจ้างสามารถติดต่อคุณได้
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
          <Step1PersonalInfo
            initialData={initialData}
            onSubmit={handleSubmit}
            showBackButton={false}
            submitText="บันทึก"
            isLoading={isLoading}
          />
        </div>

        {/* Footer buttons handled by Step1PersonalInfo */}
      </SheetContent>
    </Sheet>
  );
}
