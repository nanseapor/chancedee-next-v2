/**
 * Unit Tests for useChatRooms Hook
 * Per CHAT-R01 RIS §4.2 Data Fetching
 *
 * RED Phase: These tests should FAIL because the hook doesn't exist yet.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// This import will fail in RED phase - hook doesn't exist yet
import { useChatRooms } from "@/hooks/jobsmarket/chat/use-chat-rooms";

// Mock SWR
vi.mock("swr", () => ({
  default: vi.fn(),
}));

// Mock the server action
vi.mock("@/lib/database/actions/chat-rooms", () => ({
  fetchChatRoomsMetadata: vi.fn(),
}));

import useSWR from "swr";
import { fetchChatRoomsMetadata } from "@/lib/database/actions/chat-rooms";

describe("useChatRooms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockRoomsData = {
    rooms: [
      {
        uid: "room-1",
        otherPartyId: "company-456",
        otherPartyName: "Test Company",
        otherPartyPhoto: "https://example.com/logo.png",
        positionContext: "Frontend Developer",
        lastMessageText: "สวัสดีครับ",
        lastMessageTime: Date.now(),
        lastMessageSender: "hr" as const,
        unreadCount: 2,
        hasPendingAppointment: false,
      },
      {
        uid: "room-2",
        otherPartyId: "company-789",
        otherPartyName: "Another Company",
        otherPartyPhoto: null,
        positionContext: "Backend Developer",
        lastMessageText: "ขอบคุณครับ",
        lastMessageTime: Date.now() - 1000,
        lastMessageSender: "candidate" as const,
        unreadCount: 0,
        hasPendingAppointment: true,
      },
    ],
    currentUser: {
      id: "candidate-123",
      role: "candidate" as const,
    },
  };

  it("should fetch rooms on mount", () => {
    vi.mocked(useSWR).mockReturnValue({
      data: mockRoomsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => useChatRooms({ navBar: "candidate" }));

    expect(useSWR).toHaveBeenCalledWith(
      expect.arrayContaining(["chat-rooms", "candidate"]),
      expect.any(Function),
      expect.objectContaining({
        dedupingInterval: 30000,
        refreshInterval: 60000,
        revalidateOnFocus: true,
      })
    );
  });

  it("should return loading state initially", () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => useChatRooms({ navBar: "candidate" }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.rooms).toEqual([]);
  });

  it("should return rooms after fetch", () => {
    vi.mocked(useSWR).mockReturnValue({
      data: mockRoomsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => useChatRooms({ navBar: "candidate" }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.rooms).toHaveLength(2);
    expect(result.current.rooms[0].otherPartyName).toBe("Test Company");
    expect(result.current.currentUser).toEqual({
      id: "candidate-123",
      role: "candidate",
    });
  });

  it("should return error on fetch failure", () => {
    const mockError = new Error("Network error");

    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => useChatRooms({ navBar: "candidate" }));

    expect(result.current.error).toBe(mockError);
    expect(result.current.rooms).toEqual([]);
  });

  it("should dedupe requests within 30 seconds", () => {
    vi.mocked(useSWR).mockReturnValue({
      data: mockRoomsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    renderHook(() => useChatRooms({ navBar: "candidate" }));

    // Verify SWR is called with correct dedupingInterval
    expect(useSWR).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        dedupingInterval: 30000, // 30 seconds
      })
    );
  });

  it("should refresh every 60 seconds", () => {
    vi.mocked(useSWR).mockReturnValue({
      data: mockRoomsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    renderHook(() => useChatRooms({ navBar: "candidate" }));

    // Verify SWR is called with correct refreshInterval
    expect(useSWR).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        refreshInterval: 60000, // 60 seconds
      })
    );
  });

  it("should revalidate on focus", () => {
    vi.mocked(useSWR).mockReturnValue({
      data: mockRoomsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as any);

    renderHook(() => useChatRooms({ navBar: "candidate" }));

    // Verify SWR is called with revalidateOnFocus
    expect(useSWR).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        revalidateOnFocus: true,
      })
    );
  });

  it("should provide mutate function for manual revalidation", () => {
    const mockMutate = vi.fn();

    vi.mocked(useSWR).mockReturnValue({
      data: mockRoomsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    } as any);

    const { result } = renderHook(() => useChatRooms({ navBar: "candidate" }));

    expect(result.current.mutate).toBe(mockMutate);
  });

  describe("client-side filtering", () => {
    it("should filter rooms by search query", () => {
      vi.mocked(useSWR).mockReturnValue({
        data: mockRoomsData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() =>
        useChatRooms({ navBar: "candidate", searchQuery: "Test" })
      );

      // Should only return rooms matching "Test"
      expect(result.current.filteredRooms).toHaveLength(1);
      expect(result.current.filteredRooms[0].otherPartyName).toBe("Test Company");
    });

    it("should return all rooms when search query is empty", () => {
      vi.mocked(useSWR).mockReturnValue({
        data: mockRoomsData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() =>
        useChatRooms({ navBar: "candidate", searchQuery: "" })
      );

      expect(result.current.filteredRooms).toHaveLength(2);
    });

    it("should search case-insensitively", () => {
      vi.mocked(useSWR).mockReturnValue({
        data: mockRoomsData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() =>
        useChatRooms({ navBar: "candidate", searchQuery: "test company" })
      );

      expect(result.current.filteredRooms).toHaveLength(1);
    });
  });
});
