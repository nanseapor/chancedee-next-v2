"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoomInterview } from "@/types/chat.types";

export interface RescheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    from: string;
    to: string;
    channel?: "online" | "onsite";
    location?: string;
    meetingLink?: string;
  }) => void;
  interview: RoomInterview;
  isLoading?: boolean;
}

export function RescheduleInterviewModal({
  isOpen,
  onClose,
  onSubmit,
  interview,
  isLoading = false,
}: RescheduleInterviewModalProps) {
  const [date, setDate] = useState("");
  const [from, setFrom] = useState(interview.from);
  const [to, setTo] = useState(interview.to);

  const [errors, setErrors] = useState<{
    date?: string;
    to?: string;
  }>({});

  const currentDate = new Date(interview.appointment);
  const formattedCurrentDate = currentDate.toLocaleDateString("th-TH");
  const formattedCurrentTime = `${interview.from} - ${interview.to}`;

  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {};

    // Validate date is in the future
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.date = "วันที่ต้องเป็นอนาคต";
      }
    }

    // Validate time range
    if (from && to) {
      const fromParts = from.split(":");
      const toParts = to.split(":");
      const fromHours = parseInt(fromParts[0] || "0", 10);
      const fromMins = parseInt(fromParts[1] || "0", 10);
      const toHours = parseInt(toParts[0] || "0", 10);
      const toMins = parseInt(toParts[1] || "0", 10);
      const fromMinutes = fromHours * 60 + fromMins;
      const toMinutes = toHours * 60 + toMins;

      if (toMinutes <= fromMinutes) {
        newErrors.to = "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [date, from, to]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    onSubmit({
      date,
      from,
      to,
    });
  }, [date, from, to, onSubmit, validateForm]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เลื่อนนัดสัมภาษณ์</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Interview Info */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <p className="text-sm font-medium text-gray-700">นัดหมายปัจจุบัน</p>
            <p className="text-sm text-gray-600">{formattedCurrentDate}</p>
            <p className="text-sm text-gray-600">{formattedCurrentTime}</p>
            <p className="text-sm text-gray-600">
              {interview.channel === "online" ? "ออนไลน์" : "ออนไซต์"}
            </p>
          </div>

          {/* New Date Field */}
          <div className="space-y-2">
            <Label htmlFor="newDate">วันที่ใหม่</Label>
            <Input
              id="newDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* New Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newFrom">เวลาเริ่มใหม่</Label>
              <Input
                id="newFrom"
                type="time"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTo">เวลาสิ้นสุดใหม่</Label>
              <Input
                id="newTo"
                type="time"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={isLoading}
              />
              {errors.to && (
                <p className="text-sm text-red-500">{errors.to}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && (
              <Loader2
                data-testid="submit-loading-indicator"
                className="h-4 w-4 animate-spin mr-2"
              />
            )}
            ยืนยัน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
