"use client";

import { useState, useCallback, useRef, KeyboardEvent } from "react";
import { Paperclip, Send, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { MessageInputProps } from "@/types/chat.types";

export function MessageInput({
  onSend,
  onAttachmentClick,
  isSending = false,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    onSend(trimmedMessage);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, onSend, isSending, disabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, []);

  const canSend = message.trim().length > 0 && !isSending && !disabled;

  return (
    <div
      data-testid="message-input-container"
      className="flex items-end gap-2 p-4 border-t bg-background shrink-0"
    >
      <Button
        data-testid="attachment-button"
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onAttachmentClick}
        disabled={disabled}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          data-testid="message-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="พิมพ์ข้อความ..."
          disabled={disabled}
          className={cn(
            "min-h-[40px] max-h-[120px] resize-none py-2 pr-10",
            disabled && "opacity-50"
          )}
          rows={1}
        />
      </div>

      <Button
        data-testid="send-button"
        type="button"
        size="icon"
        className={cn(
          "shrink-0 transition-colors",
          canSend
            ? "bg-secondary-500 hover:bg-secondary-600 text-white"
            : "bg-muted text-muted-foreground"
        )}
        onClick={handleSend}
        disabled={!canSend}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
