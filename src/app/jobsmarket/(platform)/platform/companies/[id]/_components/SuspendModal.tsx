"use client";

import { useState } from "react";
import { Pause } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * SuspendModal component
 * Per ADM-R02 Company Management RIS §3.3.3 Suspend Action
 *
 * Form dialog for suspending an approved company with reason and optional duration.
 */

interface SuspendModalCompany {
  id: string;
  companyName: string;
}

export interface SuspendModalProps {
  isOpen: boolean;
  company: SuspendModalCompany;
  onConfirm: (reason: string, duration?: number) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DURATION_OPTIONS = [
  { value: "0", label: "ถาวร" },
  { value: "7", label: "7 วัน" },
  { value: "30", label: "30 วัน" },
  { value: "90", label: "90 วัน" },
];

export function SuspendModal({
  isOpen,
  company,
  onConfirm,
  onCancel,
  isLoading,
}: SuspendModalProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<string>("0");

  const handleConfirm = () => {
    if (reason.trim()) {
      const durationDays = parseInt(duration, 10);
      onConfirm(reason.trim(), durationDays);
    }
  };

  const handleClose = () => {
    setReason("");
    setDuration("0");
    onCancel();
  };

  const isValid = reason.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
              <Pause className="h-5 w-5 text-rose-600" />
            </div>
            <DialogTitle>ระงับบริษัท</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            ดำเนินการกับบริษัท{" "}
            <span className="font-medium text-gray-900">
              {company.companyName}
            </span>{" "}
            หรือไม่?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="suspension-reason" className="text-sm font-medium">
              เหตุผล <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="suspension-reason"
              aria-label="เหตุผล"
              placeholder="กรุณาระบุเหตุผลในการระงับ"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              required
              className="mt-2 min-h-[100px]"
            />
            <p className="mt-1 text-xs text-gray-500">
              {reason.length} / 500 ตัวอักษร
            </p>
          </div>

          <div data-testid="duration-selector">
            <Label htmlFor="duration" className="text-sm font-medium">
              ระยะเวลา
            </Label>
            <Select
              value={duration}
              onValueChange={setDuration}
              disabled={isLoading}
            >
              <SelectTrigger id="duration" className="mt-2">
                <SelectValue placeholder="เลือกระยะเวลา" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
