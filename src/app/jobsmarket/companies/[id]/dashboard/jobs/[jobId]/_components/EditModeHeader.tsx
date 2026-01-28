"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X } from 'lucide-react';

interface EditModeHeaderProps {
  jobTitle: string;
  isDirty: boolean;
  isSaving: boolean;
  validationErrors?: number;
  onSave: () => void;
  onCancel: () => void;
}

export function EditModeHeader({
  jobTitle,
  isDirty,
  isSaving,
  validationErrors = 0,
  onSave,
  onCancel,
}: EditModeHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{jobTitle}</h1>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              กำลังแก้ไข
            </Badge>
          </div>
          {isDirty && (
            <p className="text-sm text-muted-foreground">
              มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
            </p>
          )}
          {validationErrors > 0 && (
            <p className="text-sm text-red-500">
              พบข้อผิดพลาด {validationErrors} รายการ
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-2" />
            ยกเลิก
          </Button>

          <Button
            onClick={onSave}
            disabled={!isDirty || isSaving || validationErrors > 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
