"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  ChatRoomClientProps,
  OptimisticMessage,
} from "@/types/chat.types";
import { useChatMessages } from "@/hooks/jobsmarket/chat/use-chat-messages";
import { useChatFileUpload } from "@/hooks/jobsmarket/chat/use-chat-file-upload";
import { useInterviewActions } from "@/hooks/jobsmarket/chat/use-interview-actions";
import { ChatRoomHeader } from "./ChatRoomHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { InterviewCard } from "./InterviewCard";
import { ConnectionBanner } from "./ConnectionBanner";
import { AttachmentPreview } from "./AttachmentPreview";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";
import { RescheduleInterviewModal } from "./RescheduleInterviewModal";
import { CancelConfirmDialog } from "./CancelConfirmDialog";
import { DeclineConfirmDialog } from "./DeclineConfirmDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast-notification";

export function ChatRoomClient({
  roomId,
  initialRoomDetails,
  initialMessages = [],
  userId,
}: ChatRoomClientProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Interview state - track local overrides for optimistic updates
  // The base interview data comes from props, we only track modifications locally
  const [interviewOverrides, setInterviewOverrides] = useState<Partial<typeof initialRoomDetails.interview>>({});

  // Derive the displayed interview by merging props with local overrides
  // When server refreshes and props update, the correct values will be shown
  const interview = initialRoomDetails.interview
    ? { ...initialRoomDetails.interview, ...interviewOverrides }
    : null;

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  const {
    messages,
    isLoading,
    isConnected,
    hasMore,
    error,
    sendMessage,
    loadMore,
    markAsRead,
  } = useChatMessages({
    roomId,
    userId,
    initialMessages: initialMessages as OptimisticMessage[],
  });

  const {
    upload,
    isUploading,
    progress,
    error: uploadError,
    reset: resetUpload,
  } = useChatFileUpload({ roomId });

  // Interview actions hook with toast notifications
  const {
    isLoading: isInterviewActionLoading,
    loadingAction,
    handleConfirm,
    handleDecline,
    handleCancel,
    handleReschedule,
    handleScheduleNew,
  } = useInterviewActions({
    interviewId: interview?.uid,
    onSuccess: (action, extra) => {
      const messages: Record<string, string> = {
        confirm: "ยืนยันนัดหมายสำเร็จ",
        decline: "ปฏิเสธนัดหมายสำเร็จ",
        cancel: "ยกเลิกนัดหมายสำเร็จ",
        reschedule: "เลื่อนนัดหมายสำเร็จ",
        scheduleNew: "นัดหมายสำเร็จ",
      };
      addToast(messages[action] || "ดำเนินการสำเร็จ", "success");

      // Show reward notification for first interview confirmation
      if (action === "confirm" && extra?.rewardAwarded) {
        addToast("🎉 ยินดีด้วย! ได้รับ 100 เหรียญสำหรับการสัมภาษณ์ครั้งแรก", "success");
      }

      // Update local interview overrides optimistically
      if (initialRoomDetails.interview) {
        if (action === "confirm") {
          setInterviewOverrides({ status: "confirmed", isAccepted: true });
        } else if (action === "decline") {
          setInterviewOverrides({ status: "declined", isAccepted: false });
        } else if (action === "cancel") {
          setInterviewOverrides({ status: "cancelled", isCancel: true });
        } else if (action === "reschedule") {
          setInterviewOverrides({ status: "pending", isAccepted: false });
        }
      }
    },
    onError: (_action, error) => {
      addToast(`เกิดข้อผิดพลาด: ${error.message}`, "error");
    },
  });

  // Mark messages as read on mount and when new messages arrive
  useEffect(() => {
    markAsRead();
  }, [markAsRead, messages.length]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
      await upload(file);
      setSelectedFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [upload]
  );

  const handleRemoveAttachment = useCallback(() => {
    setSelectedFile(null);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetUpload]);

  const handleRetryMessage = useCallback(
    (messageId: string) => {
      // Find the failed message and retry
      const failedMessage = messages.find((m) => m.messageId === messageId);
      if (failedMessage) {
        sendMessage(failedMessage.message);
      }
    },
    [messages, sendMessage]
  );

  const connectionStatus = isConnected
    ? "connected"
    : error
      ? "error"
      : "reconnecting";

  const { otherParty, currentUser } = initialRoomDetails;

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatRoomHeader
        otherPartyName={otherParty.name}
        otherPartyPhoto={otherParty.photo}
        otherPartyId={otherParty.id}
        onBack={handleBack}
      />

      <ConnectionBanner
        status={connectionStatus}
        onRetry={() => window.location.reload()}
      />

      {error && !isLoading && (
        <div
          data-testid="error-message"
          className="p-4 bg-destructive/10 text-destructive text-center"
        >
          เกิดข้อผิดพลาด: {error.message}
        </div>
      )}

      {/* Schedule Interview Button - shown for company when no interview exists */}
      {!interview && currentUser.role === "company" && (
        <div className="p-4 border-b">
          <Button
            onClick={() => setShowScheduleModal(true)}
            className="w-full"
            variant="default"
          >
            <Calendar className="w-4 h-4 mr-2" />
            นัดสัมภาษณ์
          </Button>
        </div>
      )}

      {interview && (
        <InterviewCard
          interview={interview}
          userRole={currentUser.role}
          onConfirm={currentUser.role === "candidate" ? handleConfirm : undefined}
          onDecline={currentUser.role === "candidate" ? () => setShowDeclineDialog(true) : undefined}
          onCancel={currentUser.role === "company" ? () => setShowCancelDialog(true) : undefined}
          onReschedule={currentUser.role === "company" ? () => setShowRescheduleModal(true) : undefined}
          onScheduleNew={currentUser.role === "company" ? () => setShowScheduleModal(true) : undefined}
          isActionLoading={isInterviewActionLoading}
          loadingAction={loadingAction ?? undefined}
        />
      )}

      <MessageList
        messages={messages}
        currentUserId={userId}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={handleRetryMessage}
      />

      {selectedFile && isUploading && (
        <div className="px-4">
          <AttachmentPreview
            file={selectedFile}
            onRemove={handleRemoveAttachment}
            progress={progress}
            isUploading={isUploading}
          />
        </div>
      )}

      {isUploading && (
        <div data-testid="upload-progress" className="px-4 py-2 text-sm text-muted-foreground">
          กำลังอัปโหลด {progress}%
        </div>
      )}

      <input
        ref={fileInputRef}
        data-testid="file-input"
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <MessageInput
        onSend={handleSendMessage}
        onAttachmentClick={handleAttachmentClick}
        isSending={isUploading}
        disabled={!isConnected}
      />

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={async (data) => {
          await handleScheduleNew({
            applicationId: interview?.applicationId || initialRoomDetails.room.applicationId || roomId,
            date: data.date,
            from: data.from,
            to: data.to,
            channel: data.channel,
            location: data.location,
            meetingLink: data.meetingLink,
            note: data.note,
          });
          setShowScheduleModal(false);
        }}
        applicationId={interview?.applicationId || initialRoomDetails.room.applicationId || roomId}
        isLoading={isInterviewActionLoading}
      />

      {/* Reschedule Interview Modal */}
      {interview && (
        <RescheduleInterviewModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={async (data) => {
            await handleReschedule(data);
            setShowRescheduleModal(false);
          }}
          interview={interview}
          isLoading={isInterviewActionLoading}
        />
      )}

      {/* Cancel Interview Dialog */}
      {interview && (
        <CancelConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={async (reason) => {
            await handleCancel(reason);
            setShowCancelDialog(false);
          }}
          interviewDate={new Date(interview.appointment)}
          isLoading={isInterviewActionLoading}
        />
      )}

      {/* Decline Interview Dialog */}
      {interview && (
        <DeclineConfirmDialog
          isOpen={showDeclineDialog}
          onClose={() => setShowDeclineDialog(false)}
          onConfirm={async (feedback) => {
            await handleDecline(feedback);
            setShowDeclineDialog(false);
          }}
          interviewDate={new Date(interview.appointment)}
          companyName={otherParty.name}
          isLoading={isInterviewActionLoading}
        />
      )}
    </div>
  );
}
