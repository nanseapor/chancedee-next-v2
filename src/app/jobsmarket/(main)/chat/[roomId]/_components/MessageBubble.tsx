"use client";

import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MessageBubbleProps } from "@/types/chat.types";

export function MessageBubble({
  message,
  currentUserId,
  onRetry,
  onImageClick,
  onDownload,
}: MessageBubbleProps) {
  const isMine = message.senderId === currentUserId;
  const formattedTime = format(new Date(message.timestamp), "HH:mm", {
    locale: th,
  });

  const renderStatus = () => {
    if (!isMine) return null;

    switch (message.status) {
      case "sending":
        return (
          <Loader2
            data-testid="status-sending"
            className="h-3 w-3 animate-spin text-muted-foreground"
          />
        );
      case "failed":
        return (
          <div className="flex items-center gap-1">
            <AlertCircle
              data-testid="status-failed"
              className="h-3 w-3 text-destructive"
            />
            {onRetry && (
              <Button
                data-testid="retry-button"
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => onRetry(message.messageId)}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      case "sent":
      default:
        return message.unread?.length === 0 ? (
          <CheckCheck
            data-testid="status-read"
            className="h-3 w-3 text-secondary-500"
          />
        ) : (
          <Check
            data-testid="status-sent"
            className="h-3 w-3 text-muted-foreground"
          />
        );
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <Button
            data-testid="image-content"
            variant="ghost"
            className="p-0 h-auto cursor-pointer overflow-hidden rounded-lg"
            onClick={() => message.attachments && onImageClick?.(message.attachments)}
          >
            <img
              src={message.attachments || ""}
              alt="รูปภาพที่แชร์"
              className="max-w-[200px] max-h-[200px] object-cover"
            />
          </Button>
        );

      case "file":
        return (
          <div
            data-testid="file-content"
            className="flex items-center gap-2 p-2 bg-background/50 rounded-lg"
          >
            <FileText className="h-8 w-8 text-secondary-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.message || "ไฟล์แนบ"}
              </p>
            </div>
            {onDownload && message.attachments && (
              <Button
                data-testid="download-button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() =>
                  onDownload(message.attachments!, message.message || "file")
                }
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      case "text":
      default:
        return (
          <p data-testid="text-content" className="whitespace-pre-wrap break-words">
            {message.message}
          </p>
        );
    }
  };

  return (
    <div
      data-testid="message-bubble"
      className={cn(
        "flex w-full mb-2",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isMine
            ? "bg-secondary-500 text-white rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        {renderContent()}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isMine ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-xs",
              isMine ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {formattedTime}
          </span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}
