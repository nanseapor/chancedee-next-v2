"use client";

import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InterviewCardProps, InterviewStatus } from "@/types/chat.types";

const statusConfig: Record<
  InterviewStatus,
  { label: string; variant: "waiting" | "success" | "problem" | "neutral"; icon: typeof CheckCircle2 }
> = {
  pending: {
    label: "รอยืนยัน",
    variant: "waiting",
    icon: AlertCircle,
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    variant: "success",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "ยกเลิก",
    variant: "problem",
    icon: XCircle,
  },
  rescheduled: {
    label: "เลื่อนนัด",
    variant: "waiting",
    icon: AlertCircle,
  },
  completed: {
    label: "เสร็จสิ้น",
    variant: "neutral",
    icon: CheckCircle2,
  },
};

const badgeVariantClasses = {
  waiting: "bg-amber-100 text-amber-700 border-amber-700",
  success: "bg-green-100 text-green-700 border-green-700",
  problem: "bg-rose-100 text-rose-700 border-rose-700",
  neutral: "bg-gray-100 text-gray-600 border-gray-600",
};

export function InterviewCard({ interview, userRole }: InterviewCardProps) {
  const config = statusConfig[interview.status];
  const StatusIcon = config.icon;

  const appointmentDate = new Date(interview.appointment);
  const formattedDate = format(appointmentDate, "EEEE d MMMM yyyy", {
    locale: th,
  });

  const isOnline = interview.channel === "online";

  return (
    <Card data-testid="interview-card" className="mx-4 my-2 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            นัดสัมภาษณ์
          </CardTitle>
          <Badge
            data-testid="interview-status-badge"
            variant="outline"
            className={cn(
              "flex items-center gap-1",
              badgeVariantClasses[config.variant]
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-secondary-500 shrink-0" />
          <span data-testid="interview-date">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-secondary-500 shrink-0" />
          <span data-testid="interview-time">
            {interview.from} - {interview.to}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Video className="h-4 w-4 text-secondary-500 shrink-0" />
              <span data-testid="interview-channel">สัมภาษณ์ออนไลน์</span>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 text-secondary-500 shrink-0" />
              <span data-testid="interview-channel">สัมภาษณ์ที่บริษัท</span>
            </>
          )}
        </div>

        {interview.location && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-secondary-500 shrink-0 mt-0.5" />
            <span data-testid="interview-location" className="text-muted-foreground">
              {interview.location}
            </span>
          </div>
        )}

        {interview.meetingLink && isOnline && (
          <div className="pt-2">
            <a
              data-testid="meeting-link"
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary-600 hover:text-secondary-700 underline"
            >
              เข้าร่วมการประชุม
            </a>
          </div>
        )}

        {interview.note && (
          <div className="pt-2 border-t">
            <p
              data-testid="interview-note"
              className="text-sm text-muted-foreground"
            >
              {interview.note}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
