"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { MessageListProps, OptimisticMessage } from "@/types/chat.types";
import { MessageBubble } from "./MessageBubble";
import { DateDivider } from "./DateDivider";
import { SystemMessage } from "./SystemMessage";

interface GroupedMessages {
  date: string;
  messages: OptimisticMessage[];
}

function groupMessagesByDate(messages: OptimisticMessage[]): GroupedMessages[] {
  const groups: Map<string, OptimisticMessage[]> = new Map();

  messages.forEach((message) => {
    const date = new Date(message.timestamp).toDateString();
    const existing = groups.get(date) || [];
    groups.set(date, [...existing, message]);
  });

  return Array.from(groups.entries()).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  onRetry,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Handle scroll for loading more
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop === 0) {
      onLoadMore();
    }
  }, [isLoading, hasMore, onLoadMore]);

  if (isLoading && messages.length === 0) {
    return (
      <div
        data-testid="message-list-skeleton"
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <Skeleton
              className={`h-12 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-2xl`}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        data-testid="message-list-empty"
        className="flex-1 flex items-center justify-center p-4"
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">ยังไม่มีข้อความ</p>
          <p className="text-sm">เริ่มการสนทนาด้วยการส่งข้อความ</p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={containerRef}
      data-testid="message-list-container"
      className="flex-1 overflow-y-auto p-4"
      onScroll={handleScroll}
    >
      {hasMore && (
        <div className="flex justify-center py-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <button
              data-testid="load-more-button"
              onClick={onLoadMore}
              className="text-sm text-secondary-600 hover:text-secondary-700"
            >
              โหลดข้อความก่อนหน้า
            </button>
          )}
        </div>
      )}

      {groupedMessages.map((group) => (
        <div key={group.date}>
          <DateDivider date={new Date(group.date)} />
          {group.messages.map((message) => {
            // Check for system message types - interview and interview-reschedule are shown as system messages
            const isSystemType =
              message.type === "interview" ||
              message.type === "interview-reschedule";

            if (isSystemType) {
              return (
                <SystemMessage
                  key={message.messageId}
                  message={message.message}
                  timestamp={message.timestamp}
                  type={message.type}
                />
              );
            }

            return (
              <MessageBubble
                key={message.messageId}
                message={message}
                currentUserId={currentUserId}
                onRetry={onRetry}
              />
            );
          })}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
