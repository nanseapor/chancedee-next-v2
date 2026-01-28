"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CancelConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  interviewDate: Date;
  isLoading?: boolean;
}

export function CancelConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  interviewDate,
  isLoading = false,
}: CancelConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formattedDate = interviewDate.toLocaleDateString("th-TH");

  const handleConfirm = useCallback(() => {
    // Validate reason length
    if (reason.length > 500) {
      setError("เหตุผลต้องไม่เกิน 500 ตัวอักษร");
      return;
    }

    setError(null);
    onConfirm(reason.trim() || undefined);
  }, [reason, onConfirm]);

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการยกเลิกนัดสัมภาษณ์</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>คุณกำลังจะยกเลิกนัดสัมภาษณ์วันที่ {formattedDate}</p>
              <p className="text-red-500 font-medium">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="cancelReason">
            เหตุผลในการยกเลิก <span className="text-gray-400 text-xs">(ไม่บังคับ)</span>
          </Label>
          <Textarea
            id="cancelReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            placeholder="กรุณากรอกเหตุผล (ถ้ามี)"
            rows={3}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            ย้อนกลับ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading && (
              <Loader2
                data-testid="confirm-loading-indicator"
                className="h-4 w-4 animate-spin mr-2"
              />
            )}
            ยืนยันยกเลิก
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
