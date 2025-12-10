"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Send } from "lucide-react";
import type React from "react";
import { type KeyboardEvent, useState } from "react";

interface InputAreaProps {
  onSendMessage: (message: string) => Promise<void>;
  onClearChat: () => void;
  disabled: boolean;
  allowFileUpload?: boolean;
}

export function InputArea({
  onSendMessage,
  onClearChat,
  disabled,
  allowFileUpload = false,
}: InputAreaProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      await onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4 sm:p-6">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="พิมพ์ข้อความของคุณ..."
          className="min-h-[44px] resize-none"
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onClearChat}
          className="shrink-0 bg-transparent"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
