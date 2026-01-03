"use client";

import { useMemo } from "react";
import useSWR from "swr";

import { fetchChatRoomsMetadata } from "@/lib/database/actions/chat-rooms";
import type {
  RoomListItem,
  ChatCurrentUser,
  ChatRoomsMetadataResponse,
} from "@/types/chat.types";

interface UseChatRoomsParams {
  navBar: "candidate" | "company";
  searchQuery?: string;
}

interface UseChatRoomsReturn {
  rooms: RoomListItem[];
  filteredRooms: RoomListItem[];
  currentUser: ChatCurrentUser | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch and manage chat rooms
 * Per CHAT-R01 RIS §4.2 Data Fetching
 *
 * Features:
 * - SWR caching with 30s dedupe interval
 * - Auto-refresh every 60 seconds
 * - Revalidate on window focus
 * - Client-side search filtering
 */
export function useChatRooms({
  navBar,
  searchQuery = "",
}: UseChatRoomsParams): UseChatRoomsReturn {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<ChatRoomsMetadataResponse, Error>(
    ["chat-rooms", navBar],
    async () => {
      return await fetchChatRoomsMetadata({ navBar });
    },
    {
      dedupingInterval: 30000, // 30 seconds
      refreshInterval: 60000, // 60 seconds
      revalidateOnFocus: true,
      shouldRetryOnError: (err) => {
        // Don't retry on auth errors
        return !err.message?.includes("UNAUTHORIZED");
      },
    }
  );

  // Client-side search filtering
  const filteredRooms = useMemo(() => {
    const rooms = data?.rooms || [];

    if (!searchQuery.trim()) {
      return rooms;
    }

    const query = searchQuery.toLowerCase().trim();
    return rooms.filter(
      (room) =>
        room.otherPartyName.toLowerCase().includes(query) ||
        room.positionContext?.toLowerCase().includes(query) ||
        room.lastMessageText?.toLowerCase().includes(query)
    );
  }, [data?.rooms, searchQuery]);

  return {
    rooms: data?.rooms || [],
    filteredRooms,
    currentUser: data?.currentUser || null,
    isLoading,
    error: error || null,
    mutate,
  };
}
