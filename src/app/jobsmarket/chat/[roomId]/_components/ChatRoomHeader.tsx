"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatRoomHeaderProps } from "@/types/chat.types";

export function ChatRoomHeader({
  otherPartyName,
  otherPartyPhoto,
  positionContext,
  isOnline,
  onBack,
  onMenuClick,
}: ChatRoomHeaderProps) {
  const initials = otherPartyName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      data-testid="chat-room-header"
      className="flex items-center gap-3 p-4 border-b bg-background shrink-0"
    >
      <Button
        data-testid="back-button"
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onBack}
        aria-label="กลับ"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={otherPartyPhoto || undefined}
            alt={`${otherPartyName} avatar`}
          />
          <AvatarFallback data-testid="avatar-fallback">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isOnline !== undefined && (
          <span
            data-testid="online-status"
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-base truncate">{otherPartyName}</h2>
        {positionContext && (
          <p className="text-xs text-muted-foreground truncate">
            {positionContext}
          </p>
        )}
      </div>

      {onMenuClick && (
        <Button
          data-testid="menu-button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onMenuClick}
          aria-label="เมนู"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
