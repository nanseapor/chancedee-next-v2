"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Message } from "@/types/chat";
import { Copy } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="group relative max-w-[70%]">
          <div className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="absolute -bottom-7 right-0 text-xs opacity-70"
          >
            {formatTime(message.timestamp)}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="group relative max-w-[70%]">
        <Card className="border-input shadow-sm">
          <CardContent className="relative p-3">
            <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
              {message.content}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3" />
            </Button>
            {copied && (
              <span className="absolute right-2 top-8 text-xs text-muted-foreground">
                คัดลอกแล้ว!
              </span>
            )}
          </CardContent>
        </Card>
        <Badge
          variant="secondary"
          className="absolute -bottom-7 left-0 text-xs opacity-70"
        >
          {formatTime(message.timestamp)}
        </Badge>
      </div>
    </div>
  );
}
