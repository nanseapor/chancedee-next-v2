"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * ApproveModal component
 * Per ADM-R02 Company Management RIS §3.3.1 Approve Action
 *
 * Confirmation dialog for approving a pending company.
 */

interface ApproveModalCompany {
  id: string;
  companyName: string;
}

export interface ApproveModalProps {
  isOpen: boolean;
  company: ApproveModalCompany;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ApproveModal({
  isOpen,
  company,
  onConfirm,
  onCancel,
  isLoading,
}: ApproveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle>ยืนยันการอนุมัติ</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            ดำเนินการกับบริษัท{" "}
            <span className="font-medium text-gray-900">
              {company.companyName}
            </span>{" "}
            หรือไม่?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
