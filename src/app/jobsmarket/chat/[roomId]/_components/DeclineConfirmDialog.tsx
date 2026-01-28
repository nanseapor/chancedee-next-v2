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

export interface DeclineConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  interviewDate: Date;
  companyName: string;
  isLoading?: boolean;
}

export function DeclineConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  interviewDate,
  companyName,
  isLoading = false,
}: DeclineConfirmDialogProps) {
  const [reason, setReason] = useState("");

  const formattedDate = interviewDate.toLocaleDateString("th-TH");

  const handleConfirm = useCallback(() => {
    onConfirm(reason.trim() || undefined);
  }, [reason, onConfirm]);

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการปฏิเสธนัดสัมภาษณ์</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>คุณกำลังจะปฏิเสธนัดสัมภาษณ์กับ {companyName}</p>
              <p>วันที่ {formattedDate}</p>
              <p className="text-amber-600 font-medium">
                บริษัทอาจเลือกไม่นัดหมายใหม่
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="declineReason">
            เหตุผลในการปฏิเสธ <span className="text-gray-400 text-xs">(ไม่บังคับ)</span>
          </Label>
          <Textarea
            id="declineReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            placeholder="กรุณากรอกเหตุผล (ถ้ามี)"
            rows={3}
          />
          <p className="text-xs text-gray-500">
            การให้เหตุผลช่วยให้บริษัทเข้าใจสถานการณ์
          </p>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            ย้อนกลับ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isLoading && (
              <Loader2
                data-testid="confirm-loading-indicator"
                className="h-4 w-4 animate-spin mr-2"
              />
            )}
            ยืนยันปฏิเสธ
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
