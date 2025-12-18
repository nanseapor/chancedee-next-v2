"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ApplicationPreferencesSectionProps {
  autoAttachCoverLetter: boolean;
  coverLetterDraft: string;
  onToggleCoverLetter: (value: boolean) => void;
  onCoverLetterChange: (value: string) => void;
  isSavingToggle: boolean;
  isSavingCoverLetter: boolean;
}

/**
 * CAND-R03: Application Preferences Section
 *
 * - Toggle to auto-attach cover letter
 * - Textarea for default cover letter (shown when toggle is ON)
 * - Debounced save (500ms) for textarea
 */
export function ApplicationPreferencesSection({
  autoAttachCoverLetter,
  coverLetterDraft,
  onToggleCoverLetter,
  onCoverLetterChange,
  isSavingToggle,
  isSavingCoverLetter,
}: ApplicationPreferencesSectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium tracking-wide leading-normal text-gray-900">
            การตั้งค่าการสมัคร
          </h2>
          <p className="text-sm text-gray-500 mt-1">Application Settings</p>
        </div>

        {/* Auto-attach Cover Letter Toggle */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <Label
              htmlFor="auto-attach-cover-letter-toggle"
              className="text-base font-medium text-gray-900 cursor-pointer"
            >
              แนบจดหมายสมัครงานอัตโนมัติ
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              ใช้จดหมายสมัครงานเริ่มต้นเมื่อสมัครงาน
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Auto-attach cover letter
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSavingToggle && (
              <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
            )}
            <Switch
              id="auto-attach-cover-letter-toggle"
              checked={autoAttachCoverLetter}
              onCheckedChange={onToggleCoverLetter}
              disabled={isSavingToggle}
            />
          </div>
        </div>

        {/* Cover Letter Textarea (shown when toggle is ON) */}
        {autoAttachCoverLetter && (
          <div className="pt-2 space-y-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Label htmlFor="default-cover-letter" className="text-sm font-medium text-gray-700">
                จดหมายสมัครงานเริ่มต้น:
              </Label>
              {isSavingCoverLetter && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </div>
              )}
            </div>

            <Textarea
              id="default-cover-letter"
              placeholder="เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
              value={coverLetterDraft}
              onChange={(e) => onCoverLetterChange(e.target.value)}
              className="min-h-[200px] resize-y"
              maxLength={2000}
            />

            <p className="text-xs text-gray-500">
              {coverLetterDraft.length}/2000 ตัวอักษร
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
