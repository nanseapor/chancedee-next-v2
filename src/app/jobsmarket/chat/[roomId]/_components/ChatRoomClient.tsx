"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  ChatRoomClientProps,
  OptimisticMessage,
} from "@/types/chat.types";
import { useChatMessages } from "@/hooks/jobsmarket/chat/use-chat-messages";
import { useChatFileUpload } from "@/hooks/jobsmarket/chat/use-chat-file-upload";
import { ChatRoomHeader } from "./ChatRoomHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { InterviewCard } from "./InterviewCard";
import { ConnectionBanner } from "./ConnectionBanner";
import { AttachmentPreview } from "./AttachmentPreview";

export function ChatRoomClient({
  roomId,
  initialRoomDetails,
  initialMessages = [],
  userId,
}: ChatRoomClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const { otherParty, currentUser, interview } = initialRoomDetails;

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

      {interview && (
        <InterviewCard interview={interview} userRole={currentUser.role} />
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
    </div>
  );
}
