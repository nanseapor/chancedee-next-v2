import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  hasPublishedJobs: boolean;
  hasNonClosedJobs: boolean;
  onBulkPause: () => void;
  onBulkClose: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  hasPublishedJobs,
  hasNonClosedJobs,
  onBulkPause,
  onBulkClose,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-secondary-200 bg-secondary-50 p-4">
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-900">
          เลือกแล้ว {selectedCount} รายการ
        </span>
        {hasPublishedJobs && (
          <Button variant="outline" size="sm" onClick={onBulkPause}>
            หยุดทั้งหมด
          </Button>
        )}
        {hasNonClosedJobs && (
          <Button variant="outline" size="sm" onClick={onBulkClose}>
            ปิดทั้งหมด
          </Button>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        <X className="mr-1 h-4 w-4" />
        ล้างการเลือก
      </Button>
    </div>
  );
}
