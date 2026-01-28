"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, Clock, Save } from "lucide-react";

export interface PublishOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishNow: () => void;
  onSchedule: (date: Date) => void;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

type PublishMode = "now" | "schedule" | "draft";

/**
 * Publish options modal
 * Allows user to publish now, schedule for later, or save as draft
 */
export function PublishOptionsModal({
  isOpen,
  onClose,
  onPublishNow,
  onSchedule,
  onSaveDraft,
  isSubmitting,
}: PublishOptionsModalProps) {
  const [mode, setMode] = useState<PublishMode>("now");
  const [scheduledDate, setScheduledDate] = useState<string>("");

  const handleSubmit = () => {
    if (mode === "now") {
      onPublishNow();
    } else if (mode === "schedule") {
      if (!scheduledDate) return;
      const date = new Date(scheduledDate);
      if (date <= new Date()) {
        alert("กรุณาเลือกวันที่ในอนาคต");
        return;
      }
      onSchedule(date);
    } else {
      onSaveDraft();
    }
  };

  const canSubmit = mode === "schedule" ? scheduledDate !== "" : true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เผยแพร่ประกาศงาน</DialogTitle>
          <DialogDescription>
            เลือกวิธีการเผยแพร่ประกาศงานของคุณ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={mode} onValueChange={(value: string) => setMode(value as PublishMode)}>
            {/* Publish Now */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-gray-50">
              <RadioGroupItem value="now" id="now" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="now" className="flex items-center gap-2 cursor-pointer">
                  <Send className="h-4 w-4 text-primary-600" />
                  <span className="font-medium">เผยแพร่ทันที</span>
                </Label>
                <p className="mt-1 text-sm text-gray-600">
                  ประกาศงานจะแสดงในระบบทันทีหลังจากคุณกดยืนยัน
                </p>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-gray-50">
              <RadioGroupItem value="schedule" id="schedule" className="mt-1" />
              <div className="flex-1 space-y-3">
                <Label htmlFor="schedule" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="h-4 w-4 text-secondary-600" />
                  <span className="font-medium">ตั้งเวลาเผยแพร่</span>
                </Label>
                <p className="text-sm text-gray-600">
                  กำหนดวันเวลาที่ต้องการให้ประกาศงานแสดงในระบบ
                </p>
                {mode === "schedule" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate" className="text-sm">
                      วันที่เผยแพร่
                    </Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Draft */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-gray-50">
              <RadioGroupItem value="draft" id="draft" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="draft" className="flex items-center gap-2 cursor-pointer">
                  <Save className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">บันทึกร่าง</span>
                </Label>
                <p className="mt-1 text-sm text-gray-600">
                  บันทึกประกาศงานเป็นร่างไว้ก่อน คุณสามารถกลับมาแก้ไขและเผยแพร่ภายหลังได้
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting
              ? "กำลังดำเนินการ..."
              : mode === "now"
                ? "เผยแพร่ทันที"
                : mode === "schedule"
                  ? "ตั้งเวลาเผยแพร่"
                  : "บันทึกร่าง"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
