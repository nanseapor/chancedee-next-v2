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
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function InterviewCard({
  interview,
  userRole,
  onConfirm,
  onDecline,
  onCancel,
  onReschedule,
  onScheduleNew,
  isActionLoading = false,
  loadingAction,
}: InterviewCardProps) {
  const config = statusConfig[interview.status];
  const StatusIcon = config.icon;

  const appointmentDate = new Date(interview.appointment);
  const formattedDate = format(appointmentDate, "EEEE d MMMM yyyy", {
    locale: th,
  });

  const isOnline = interview.channel === "online";

  // Determine which buttons to show based on role, status, and callback availability
  const showCandidateActions =
    userRole === "candidate" && interview.status === "pending" && (onConfirm || onDecline);
  const showCompanyScheduledActions =
    userRole === "company" && interview.status === "pending" && (onCancel || onReschedule);
  const showCompanyCancelOnly =
    userRole === "company" && interview.status === "confirmed" && onCancel;
  const showCompanyRescheduleOnly =
    userRole === "company" && interview.status === "rescheduled" && onReschedule;
  const showCompanyScheduleNew =
    userRole === "company" && interview.status === "cancelled" && onScheduleNew;

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

        {/* Action Buttons - Candidate */}
        {showCandidateActions && (
          <div className="pt-3 flex gap-2 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={onConfirm}
              disabled={isActionLoading}
              data-loading={loadingAction === "confirm" ? "true" : undefined}
              className="flex-1"
            >
              {loadingAction === "confirm" && isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              ยืนยัน
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDecline}
              disabled={isActionLoading}
              data-loading={loadingAction === "decline" ? "true" : undefined}
              className="flex-1 text-rose-600 border-rose-300 hover:bg-rose-50"
            >
              {loadingAction === "decline" && isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              ปฏิเสธ
            </Button>
          </div>
        )}

        {/* Action Buttons - Company (Scheduled) */}
        {showCompanyScheduledActions && (
          <div className="pt-3 flex gap-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onReschedule}
              disabled={isActionLoading}
              data-loading={loadingAction === "reschedule" ? "true" : undefined}
              className="flex-1"
            >
              {loadingAction === "reschedule" && isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              เลื่อนนัด
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isActionLoading}
              data-loading={loadingAction === "cancel" ? "true" : undefined}
              className="flex-1 text-rose-600 border-rose-300 hover:bg-rose-50"
            >
              {loadingAction === "cancel" && isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              ยกเลิก
            </Button>
          </div>
        )}

        {/* Action Buttons - Company (Confirmed) - Cancel only */}
        {showCompanyCancelOnly && (
          <div className="pt-3 flex gap-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isActionLoading}
              data-loading={loadingAction === "cancel" ? "true" : undefined}
              className="flex-1 text-rose-600 border-rose-300 hover:bg-rose-50"
            >
              {loadingAction === "cancel" && isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              ยกเลิก
            </Button>
          </div>
        )}

        {/* Action Buttons - Company (Declined/Rescheduled) - Schedule new */}
        {showCompanyRescheduleOnly && (
          <div className="pt-3 flex gap-2 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={onScheduleNew}
              disabled={isActionLoading}
              data-loading={loadingAction === "scheduleNew" ? "true" : undefined}
              className="flex-1"
            >
              {loadingAction === "scheduleNew" && isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              นัดใหม่
            </Button>
          </div>
        )}

        {/* Action Buttons - Company (Cancelled) - Schedule new */}
        {showCompanyScheduleNew && (
          <div className="pt-3 flex gap-2 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={onScheduleNew}
              disabled={isActionLoading}
              data-loading={loadingAction === "scheduleNew" ? "true" : undefined}
              className="flex-1"
            >
              {loadingAction === "scheduleNew" && isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              นัดใหม่
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
