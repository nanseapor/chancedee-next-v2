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

interface CloseJobModalProps {
  isOpen: boolean;
  jobTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CloseJobModal({
  isOpen,
  jobTitle,
  onConfirm,
  onCancel,
}: CloseJobModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ปิดรับสมัครงาน</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-gray-700">
            งานนี้จะถูกซ่อนจากผู้สมัครอย่างถาวร
            คุณจะไม่สามารถเปิดรับสมัครอีกครั้งได้
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={onConfirm}>ยืนยัน</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
