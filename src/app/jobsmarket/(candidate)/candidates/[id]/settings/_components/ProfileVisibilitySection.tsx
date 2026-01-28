"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProfileVisibilitySectionProps {
  isSearchable: boolean;
  onToggle: (value: boolean) => void;
  isSaving: boolean;
}

/**
 * CAND-R03: Profile Visibility Section
 *
 * Reuses CAND-R02 is_searchable toggle pattern.
 * Allows candidates to control whether companies can find their profile.
 */
export function ProfileVisibilitySection({
  isSearchable,
  onToggle,
  isSaving,
}: ProfileVisibilitySectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium tracking-wide leading-normal text-gray-900">
            การมองเห็นโปรไฟล์
          </h2>
          <p className="text-sm text-gray-500 mt-1">Profile Visibility</p>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <Label
              htmlFor="profile-visibility-toggle"
              className="text-base font-medium text-gray-900 cursor-pointer"
            >
              อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              เมื่อเปิด บริษัทจะสามารถค้นหาและดูโปรไฟล์ของคุณได้
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Allow companies to find my profile
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />}
            <Switch
              id="profile-visibility-toggle"
              checked={isSearchable}
              onCheckedChange={onToggle}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
