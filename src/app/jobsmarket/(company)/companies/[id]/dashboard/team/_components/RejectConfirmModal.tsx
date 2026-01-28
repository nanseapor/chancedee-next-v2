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

export interface RejectConfirmModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Pending user to reject */
  pendingUser: {
    uid: string;
    displayName: string;
    email: string;
    requestTimestamp: number;
  };
  /** Handler for confirm action */
  onConfirm: (userId: string) => void;
  /** Handler for close action */
  onClose: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Modal for confirming rejection of pending employee application
 */
export function RejectConfirmModal({
  isOpen,
  pendingUser,
  onConfirm,
  onClose,
  isLoading = false,
}: RejectConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm(pendingUser.uid);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-labelledby="reject-confirm-title"
        aria-describedby="reject-confirm-description"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle id="reject-confirm-title">
              ปฏิเสธคำขอ
            </DialogTitle>
          </div>
          <DialogDescription
            id="reject-confirm-description"
            className="pt-2"
          >
            คุณต้องการปฏิเสธคำขอเข้าร่วมทีมจาก{" "}
            <span className="font-medium text-gray-900">
              {pendingUser.displayName}
            </span>{" "}
            หรือไม่?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <p>
            ผู้ใช้คนนี้จะไม่สามารถเข้าร่วมบริษัทได้ หากต้องการเข้าร่วม
            จะต้องส่งคำขอใหม่อีกครั้ง
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
                กำลังปฏิเสธ...
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
