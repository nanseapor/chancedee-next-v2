"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast-notification";
import type { FirebaseCandidateData } from "@/types/candidate.types";
import { webCandidateSaveAboutMe } from "@/lib/database/actions/candidate-information";

interface AboutMeEditDrawerProps {
  /** Is drawer open */
  open: boolean;
  /** Callback to close drawer */
  onOpenChange: (open: boolean) => void;
  /** Current candidate data */
  candidate: FirebaseCandidateData;
  /** Callback after successful save */
  onSaved?: () => void;
}

// Form schema for About Me
const aboutMeSchema = z.object({
  about_me: z.string().max(1000, "ข้อความยาวเกิน 1000 ตัวอักษร").optional(),
});

type AboutMeFormData = z.infer<typeof aboutMeSchema>;

/**
 * CAND-R02 Batch 3D: About Me Edit Drawer
 *
 * Simple text area for editing "about me" section.
 */
export function AboutMeEditDrawer({
  open,
  onOpenChange,
  candidate,
  onSaved,
}: AboutMeEditDrawerProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AboutMeFormData>({
    resolver: zodResolver(aboutMeSchema),
    defaultValues: {
      about_me: candidate.aboutMe || "",
    },
  });

  // Handle form submission
  async function onSubmit(data: AboutMeFormData) {
    setIsLoading(true);

    try {
      // Save to Firestore
      await webCandidateSaveAboutMe(candidate.uid, data, candidate.uid);

      addToast("บันทึกข้อมูลเกี่ยวกับตัวคุณสำเร็จ", "success");

      // Call onSaved callback
      onSaved?.();

      // Close drawer
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving about me:", error);
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
              <SheetTitle>แก้ไขเกี่ยวกับตัวคุณ</SheetTitle>
              <SheetDescription>
                เขียนเกี่ยวกับตัวคุณ ความสนใจ หรือสิ่งที่ต้องการบอกนายจ้าง
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
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 px-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="about_me">เกี่ยวกับตัวคุณ (ไม่บังคับ)</Label>
            <Textarea
              id="about_me"
              {...register("about_me")}
              placeholder="บอกเล่าเกี่ยวกับตัวคุณ จุดเด่น หรือสิ่งที่ต้องการให้นายจ้างรู้..."
              rows={10}
              className="resize-none"
            />
            {errors.about_me && (
              <p className="text-xs text-destructive">
                {errors.about_me.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              สูงสุด 1000 ตัวอักษร
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
