import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BulkActionModalProps {
  isOpen: boolean;
  actionType: "pause" | "close";
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BulkActionModal({
  isOpen,
  actionType,
  selectedCount,
  onConfirm,
  onCancel,
}: BulkActionModalProps) {
  const actionText = actionType === "pause" ? "หยุดชั่วคราว" : "ปิด";
  const description =
    actionType === "pause"
      ? "งานเหล่านี้จะถูกซ่อนจากผู้สมัครชั่วคราว คุณสามารถเปิดใหม่ได้ในภายหลัง"
      : "งานเหล่านี้จะถูกซ่อนจากผู้สมัครอย่างถาวร";

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionText} {selectedCount} รายการ</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
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
