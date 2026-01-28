"use client";

import { ChatRoomCard } from "./ChatRoomCard";
import { ChatEmptyState } from "./ChatEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { RoomListItem } from "@/types/chat.types";

interface ChatRoomListProps {
  /** List of rooms to display */
  rooms: RoomListItem[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Currently selected room ID */
  selectedRoomId: string | null;
  /** Callback when a room is selected */
  onSelectRoom: (roomId: string) => void;
  /** User role for empty state */
  userRole: "candidate" | "company";
  /** Current search query (for empty state) */
  searchQuery?: string;
  /** Whether current results are from search */
  isSearchResult?: boolean;
  /** Callback to clear search */
  onClearSearch?: () => void;
  /** Callback to retry loading */
  onRetry?: () => void;
}

/**
 * ChatRoomList Component
 *
 * Container for chat room cards with loading, empty, and error states.
 *
 * Per CHAT-R01 RIS §3.2 List Layout
 */
export function ChatRoomList({
  rooms,
  isLoading,
  error,
  selectedRoomId,
  onSelectRoom,
  userRole,
  searchQuery,
  isSearchResult,
  onClearSearch,
  onRetry,
}: ChatRoomListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-0" aria-label="กำลังโหลด">
        <p className="sr-only">กำลังโหลดการสนทนา...</p>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            data-testid="skeleton"
            className="flex items-start gap-3 p-4 border-b border-border"
          >
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        data-testid="chat-error-state"
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <p className="text-destructive mb-2">ไม่สามารถโหลดการสนทนา</p>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            ลองใหม่
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (rooms.length === 0) {
    // If we have a search query and no results
    if (isSearchResult && searchQuery) {
      return (
        <ChatEmptyState
          type="no_results"
          searchQuery={searchQuery}
          onClearSearch={onClearSearch}
        />
      );
    }

    // No rooms at all
    return <ChatEmptyState type={userRole} />;
  }

  // Room list
  return (
    <div role="list" className="divide-y divide-border">
      {rooms.map((room) => (
        <ChatRoomCard
          key={room.uid}
          uid={room.uid}
          otherPartyId={room.otherPartyId}
          otherPartyName={room.otherPartyName}
          otherPartyPhoto={room.otherPartyPhoto}
          positionContext={room.positionContext}
          lastMessageText={room.lastMessageText}
          lastMessageTime={room.lastMessageTime}
          lastMessageSender={room.lastMessageSender}
          unreadCount={room.unreadCount}
          hasPendingAppointment={room.hasPendingAppointment}
          isSelected={room.uid === selectedRoomId}
          onSelect={onSelectRoom}
        />
      ))}
    </div>
  );
}
