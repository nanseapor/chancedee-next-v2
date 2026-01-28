import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteJobModalProps {
  isOpen: boolean;
  jobTitle: string;
  hasApplications: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteJobModal({
  isOpen,
  jobTitle,
  hasApplications,
  onConfirm,
  onCancel,
}: DeleteJobModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ลบประกาศงาน</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-900">
                การดำเนินการนี้ไม่สามารถยกเลิกได้
              </p>
              <p className="text-sm text-red-700">
                ประกาศงานนี้จะถูกลบออกจากระบบอย่างถาวร
              </p>
            </div>
          </div>
          {hasApplications && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-900">
                ไม่สามารถลบงานที่มีใบสมัครได้
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={hasApplications}
          >
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
