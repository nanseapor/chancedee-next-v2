"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export interface NavigationGuardModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

/**
 * Navigation guard modal
 * Warns user about unsaved changes before leaving the page
 */
export function NavigationGuardModal({
  isOpen,
  onStay,
  onLeave,
}: NavigationGuardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onStay()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            หากคุณออกจากหน้านี้ การเปลี่ยนแปลงทั้งหมดจะหายไป
            คุณต้องการออกจากหน้านี้หรือไม่?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={onStay}
          >
            อยู่ต่อ
          </Button>
          <Button
            variant="destructive"
            onClick={onLeave}
          >
            ออก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
