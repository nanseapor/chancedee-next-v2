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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    from: string;
    to: string;
    channel: "online" | "onsite";
    location?: string;
    meetingLink?: string;
    note?: string;
  }) => void;
  applicationId: string;
  isLoading?: boolean;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ScheduleInterviewModalProps) {
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [channel, setChannel] = useState<"online" | "onsite">("online");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [note, setNote] = useState("");

  const [errors, setErrors] = useState<{
    date?: string;
    from?: string;
    to?: string;
    location?: string;
    note?: string;
  }>({});

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

    // Validate location when onsite
    if (channel === "onsite" && !location.trim()) {
      newErrors.location = "กรุณากรอกสถานที่";
    }

    // Validate note length
    if (note.length > 500) {
      newErrors.note = "หมายเหตุต้องไม่เกิน 500 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [date, from, to, channel, location, note]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    onSubmit({
      date,
      from,
      to,
      channel,
      location: channel === "onsite" ? location : undefined,
      meetingLink: channel === "online" ? meetingLink : undefined,
      note: note || undefined,
    });
  }, [date, from, to, channel, location, meetingLink, note, onSubmit, validateForm]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>นัดสัมภาษณ์</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="date">วันที่</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">เวลาเริ่ม</Label>
              <Input
                id="from"
                type="time"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">เวลาสิ้นสุด</Label>
              <Input
                id="to"
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

          {/* Channel Selector */}
          <div className="space-y-2">
            <Label>รูปแบบการสัมภาษณ์</Label>
            <RadioGroup
              value={channel}
              onValueChange={(value) => setChannel(value as "online" | "onsite")}
              disabled={isLoading}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">ออนไลน์</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="onsite" id="onsite" />
                <Label htmlFor="onsite">ออนไซต์</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Location/Meeting Link Fields */}
          {channel === "onsite" && (
            <div className="space-y-2">
              <Label htmlFor="location">สถานที่</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                placeholder="เช่น อาคาร A ชั้น 5"
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          )}

          {channel === "online" && (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">ลิงก์ประชุม</Label>
              <Input
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                disabled={isLoading}
                placeholder="เช่น https://meet.google.com/..."
              />
            </div>
          )}

          {/* Note Field */}
          <div className="space-y-2">
            <Label htmlFor="note">หมายเหตุ</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
              placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              rows={3}
            />
            {errors.note && (
              <p className="text-sm text-red-500">{errors.note}</p>
            )}
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
