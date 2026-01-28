"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

export interface RemoveConfirmModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Member to remove */
  member: {
    uid: string;
    displayName: string;
    email: string;
    role: string;
  };
  /** Handler for confirm action */
  onConfirm: (userId: string) => void;
  /** Handler for close action */
  onClose: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Modal for confirming member removal from company
 */
export function RemoveConfirmModal({
  isOpen,
  member,
  onConfirm,
  onClose,
  isLoading = false,
}: RemoveConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm(member.uid);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-labelledby="remove-confirm-title"
        aria-describedby="remove-confirm-description"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle id="remove-confirm-title">
              ลบสมาชิก
            </DialogTitle>
          </div>
          <DialogDescription
            id="remove-confirm-description"
            className="pt-2"
          >
            คุณต้องการลบ{" "}
            <span className="font-medium text-gray-900">
              {member.displayName}
            </span>{" "}
            ออกจากทีมหรือไม่?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <p>
            สมาชิกคนนี้จะไม่สามารถเข้าถึงข้อมูลบริษัทได้อีกต่อไป
            รวมถึงประกาศงานและใบสมัครทั้งหมด
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="destructive"
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  data-testid="confirm-loading"
                />
                กำลังลบ...
              </>
            ) : (
              "ยืนยัน"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
