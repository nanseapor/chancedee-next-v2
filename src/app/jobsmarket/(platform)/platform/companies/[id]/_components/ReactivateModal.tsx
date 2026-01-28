"use client";

import { useState } from "react";
import { Play } from "lucide-react";

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
 * ReactivateModal component
 * Per ADM-R02 Company Management RIS §3.3.4 Reactivate Action
 *
 * Confirmation dialog for reactivating a suspended company with optional note.
 */

interface ReactivateModalCompany {
  id: string;
  companyName: string;
}

export interface ReactivateModalProps {
  isOpen: boolean;
  company: ReactivateModalCompany;
  onConfirm: (note: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ReactivateModal({
  isOpen,
  company,
  onConfirm,
  onCancel,
  isLoading,
}: ReactivateModalProps) {
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    onConfirm(note.trim());
  };

  const handleClose = () => {
    setNote("");
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle>เปิดใช้งานบริษัท</DialogTitle>
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
          <Label htmlFor="reactivation-note" className="text-sm font-medium">
            หมายเหตุ <span className="text-gray-400 text-xs">(ไม่บังคับ)</span>
          </Label>
          <Textarea
            id="reactivation-note"
            aria-label="หมายเหตุ"
            placeholder="ระบุหมายเหตุ (ไม่บังคับ)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isLoading}
            className="mt-2 min-h-[80px]"
          />
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
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
