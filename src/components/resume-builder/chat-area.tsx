"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatAreaProps } from "@/types/resume";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

export function ChatArea({ messages, isTyping }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea
        className="h-full px-4 pt-6 pb-12 sm:px-6"
        ref={scrollAreaRef}
      >
        <div className="space-y-10">
          {messages.map((message, index) => (
            <div key={message.id}>
              <ChatMessage message={message} />
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
