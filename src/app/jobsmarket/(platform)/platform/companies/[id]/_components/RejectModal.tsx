"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * RejectModal component
 * Per ADM-R02 Company Management RIS §3.3.2 Reject Action
 *
 * Form dialog for rejecting a pending company with a reason.
 */

interface RejectModalCompany {
  id: string;
  companyName: string;
}

export interface RejectModalProps {
  isOpen: boolean;
  company: RejectModalCompany;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function RejectModal({
  isOpen,
  company,
  onConfirm,
  onCancel,
  isLoading,
}: RejectModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const handleClose = () => {
    setReason("");
    onCancel();
  };

  const isValid = reason.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <X className="h-5 w-5 text-rose-600" />
            </div>
            <DialogTitle>ปฏิเสธบริษัท</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            ดำเนินการกับบริษัท{" "}
            <span className="font-medium text-gray-900">
              {company.companyName}
            </span>{" "}
            หรือไม่?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="rejection-reason" className="text-sm font-medium">
            เหตุผล <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="rejection-reason"
            aria-label="เหตุผล"
            placeholder="กรุณาระบุเหตุผลในการปฏิเสธ"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            required
            aria-invalid={!isValid && reason.length > 0}
            className="mt-2 min-h-[100px]"
          />
          <p className="mt-1 text-xs text-gray-500">
            {reason.length} / 500 ตัวอักษร
          </p>
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !isValid}
          >
            {isLoading ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
