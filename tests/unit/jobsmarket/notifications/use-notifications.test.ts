/**
 * @fileoverview Unit tests for useNotifications hook
 * @specification NOTIF-R01, BLS-11
 *
 * TDD RED Phase: These tests should FAIL because the hook doesn't exist yet.
 *
 * Requirements tested:
 * - BLS-11-01: fetchBellNotifications
 * - BLS-11-02: markNotificationRead
 * - BLS-11-03: markAllNotificationsRead
 * - BLS-11-07: getFilteredNotifications
 * - NOTIF-R01.ui: Filter tabs, pagination, loading states
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
// This import will fail - hook doesn't exist yet (TDD RED phase)
import { useNotifications } from "@/hooks/jobsmarket/notifications/use-notifications";
import type {
  NotificationItem,
  GroupedRoomItem,
  NotificationFilterCategory,
} from "@/types/notification.types";

// Mock the server actions
vi.mock("@/lib/database/actions/notifications", () => ({
  fetchBellNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  getBellUnreadCount: vi.fn(),
  getFilteredNotifications: vi.fn(),
}));

import {
  fetchBellNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getBellUnreadCount,
  getFilteredNotifications,
} from "@/lib/database/actions/notifications";

describe("useNotifications", () => {
  const mockNotifications: NotificationItem[] = [
    {
      uid: "notif-1",
      roomId: "room-123",
      type: "interview",
      message: "Interview scheduled for Frontend Developer",
      timestamp: Date.now() - 1000,
      isRead: false,
      sender: {
        id: "company-456",
        name: "Test Company",
        avatar: "https://example.com/avatar.jpg",
      },
      jobTitle: "Frontend Developer",
      interviewDate: "2026-01-15",
      interviewTimeFrom: "10:00",
      interviewTimeTo: "11:00",
      interviewChannel: "online",
    },
    {
      uid: "notif-2",
      roomId: "room-456",
      type: "offer",
      message: "You have received a job offer",
      timestamp: Date.now() - 2000,
      isRead: true,
      sender: {
        id: "company-789",
        name: "Another Company",
        avatar: null,
      },
      jobTitle: "Backend Developer",
    },
    {
      uid: "notif-3",
      roomId: "room-789",
      type: "system",
      message: "Your profile has been verified",
      timestamp: Date.now() - 3000,
      isRead: false,
      sender: {
        id: "system",
        name: "ChanceDee",
        avatar: null,
      },
    },
  ];

  const mockGroupedRooms: GroupedRoomItem[] = [
    {
      roomId: "room-123",
      otherPartyName: "HR Manager",
      otherPartyPhoto: "https://example.com/hr.jpg",
      positionContext: "Frontend Developer",
      unreadCount: 3,
      lastMessagePreview: "Please confirm your availability",
      lastMessageTime: Date.now() - 1000,
      lastMessageSender: "other",
    },
    {
      roomId: "room-456",
      otherPartyName: "Recruiter",
      otherPartyPhoto: null,
      positionContext: "Backend Developer",
      unreadCount: 0,
      lastMessagePreview: "Thank you for applying",
      lastMessageTime: Date.now() - 5000,
      lastMessageSender: "other",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Hook no longer uses fetchBellNotifications directly in all cases
    // Keep this mock for backward compatibility but tests use getFilteredNotifications
    vi.mocked(fetchBellNotifications).mockResolvedValue({
      notifications: mockNotifications,
      hasMore: false,
      cursor: null,
    });

    vi.mocked(getBellUnreadCount).mockResolvedValue({
      total: 2,
      byCategory: {
        applications: 0,
        appointments: 1,
        system: 1,
      },
    });

    vi.mocked(getFilteredNotifications).mockResolvedValue({
      items: mockNotifications,
      filter: "all",
      hasMore: false,
      cursor: null,
    });

    vi.mocked(markNotificationRead).mockResolvedValue({
      success: true,
      newUnreadCount: 1,
    });

    vi.mocked(markAllNotificationsRead).mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    /**
     * Requirement: NOTIF-R01.init
     * "Hook should fetch notifications on mount"
     */
    it("should fetch notifications on mount", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Hook uses getFilteredNotifications for fetching
      expect(getFilteredNotifications).toHaveBeenCalledWith({
        filter: "all",
        cursor: null,
        limit: expect.any(Number),
      });
    });

    /**
     * Requirement: NOTIF-R01.init
     * "Hook should start with loading state"
     */
    it("should start with loading state", () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.isLoading).toBe(true);
    });

    /**
     * Requirement: NOTIF-R01.init
     * "Hook should initialize with 'all' filter by default"
     */
    it("should initialize with 'all' filter by default", () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.filter).toBe("all");
    });

    /**
     * Requirement: NOTIF-R01.init
     * "Hook should accept initial filter"
     */
    it("should accept initial filter", async () => {
      const { result } = renderHook(() => useNotifications({ initialFilter: "appointments" }));

      expect(result.current.filter).toBe("appointments");

      await waitFor(() => {
        expect(getFilteredNotifications).toHaveBeenCalledWith(
          expect.objectContaining({ filter: "appointments" })
        );
      });
    });
  });

  describe("Notification List", () => {
    /**
     * Requirement: BLS-11-01
     * "Should populate items after fetch"
     */
    it("should populate items after successful fetch", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toHaveLength(3);
      expect(result.current.items[0]).toMatchObject({
        uid: "notif-1",
        type: "interview",
      });
    });

    /**
     * Requirement: BLS-11-01
     * "Should handle empty notifications"
     */
    it("should handle empty notifications", async () => {
      vi.mocked(getFilteredNotifications).mockResolvedValue({
        items: [],
        filter: "all",
        hasMore: false,
        cursor: null,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toHaveLength(0);
    });

    /**
     * Requirement: BLS-11-01
     * "Should handle fetch error"
     */
    it("should handle fetch error", async () => {
      const error = new Error("Network error");
      vi.mocked(getFilteredNotifications).mockRejectedValue(error);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe("Network error");
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("Filter Functionality", () => {
    /**
     * Requirement: BLS-11-07
     * "Should change filter and refetch"
     */
    it("should change filter and refetch notifications", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change to appointments filter
      act(() => {
        result.current.setFilter("appointments");
      });

      expect(result.current.filter).toBe("appointments");
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(getFilteredNotifications).toHaveBeenCalledWith(
          expect.objectContaining({ filter: "appointments" })
        );
      });
    });

    /**
     * Requirement: BLS-11-08
     * "Should return grouped rooms when filter is 'messages'"
     */
    it("should return grouped rooms when filter is 'messages'", async () => {
      vi.mocked(getFilteredNotifications).mockResolvedValue({
        items: mockGroupedRooms,
        filter: "messages",
        hasMore: false,
        cursor: null,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change to messages filter
      act(() => {
        result.current.setFilter("messages");
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(2);
      });

      // Should be GroupedRoomItem, not NotificationItem
      const firstItem = result.current.items[0] as GroupedRoomItem;
      expect(firstItem).toHaveProperty("roomId");
      expect(firstItem).toHaveProperty("unreadCount");
      expect(firstItem).toHaveProperty("lastMessagePreview");
    });

    /**
     * Requirement: BLS-11-07
     * "Filter should persist across refetch"
     */
    it("should maintain filter when refreshing", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change to appointments filter
      act(() => {
        result.current.setFilter("appointments");
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Refresh
      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(getFilteredNotifications).toHaveBeenLastCalledWith(
          expect.objectContaining({ filter: "appointments" })
        );
      });
    });
  });

  describe("Pagination", () => {
    /**
     * Requirement: NOTIF-R01.pagination
     * "Should track hasMore state"
     */
    it("should track hasMore state", async () => {
      vi.mocked(getFilteredNotifications).mockResolvedValue({
        items: mockNotifications,
        filter: "all",
        hasMore: true,
        cursor: "cursor-123",
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);
    });

    /**
     * Requirement: NOTIF-R01.pagination
     * "Should load more items with cursor"
     */
    it("should load more items when loadMore called", async () => {
      // Hook has two useEffects that both call fetchNotifications on mount
      // So we need to provide mocks for initial calls + loadMore call
      vi.mocked(getFilteredNotifications)
        .mockResolvedValueOnce({
          items: mockNotifications.slice(0, 2),
          filter: "all",
          hasMore: true,
          cursor: "cursor-123",
        })
        .mockResolvedValueOnce({
          items: mockNotifications.slice(0, 2),
          filter: "all",
          hasMore: true,
          cursor: "cursor-123",
        })
        .mockResolvedValueOnce({
          items: [mockNotifications[2]],
          filter: "all",
          hasMore: false,
          cursor: null,
        });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toHaveLength(2);

      // Load more
      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(3);
      });

      expect(getFilteredNotifications).toHaveBeenCalledWith(
        expect.objectContaining({ cursor: "cursor-123" })
      );
    });

    /**
     * Requirement: NOTIF-R01.pagination
     * "Should not load more when hasMore is false"
     */
    it("should not load more when hasMore is false", async () => {
      // Hook uses getFilteredNotifications for fetching
      vi.mocked(getFilteredNotifications).mockResolvedValue({
        items: mockNotifications,
        filter: "all",
        hasMore: false,
        cursor: null,
      });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCount = vi.mocked(getFilteredNotifications).mock.calls.length;

      // Try to load more
      act(() => {
        result.current.loadMore();
      });

      // Should not make another call
      expect(vi.mocked(getFilteredNotifications).mock.calls.length).toBe(callCount);
    });
  });

  describe("Mark as Read", () => {
    /**
     * Requirement: BLS-11-02
     * "Should mark single notification as read"
     */
    it("should mark notification as read", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markAsRead("notif-1");
      });

      expect(markNotificationRead).toHaveBeenCalledWith({ messageId: "notif-1" });
    });

    /**
     * Requirement: BLS-11-02
     * "Should update item's isRead state optimistically"
     */
    it("should update item isRead state optimistically", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First item is unread
      expect((result.current.items[0] as NotificationItem).isRead).toBe(false);

      act(() => {
        result.current.markAsRead("notif-1");
      });

      // Should immediately show as read (optimistic update)
      await waitFor(() => {
        expect((result.current.items[0] as NotificationItem).isRead).toBe(true);
      });
    });

    /**
     * Requirement: BLS-11-02
     * "Should update bell count after marking as read"
     */
    it("should update bell count after marking as read", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.bellCount.total).toBe(2);

      await act(async () => {
        await result.current.markAsRead("notif-1");
      });

      // Bell count should decrease
      expect(result.current.bellCount.total).toBe(1);
    });

    /**
     * Requirement: BLS-11-02
     * "Should revert on error"
     */
    it("should revert optimistic update on error", async () => {
      vi.mocked(markNotificationRead).mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First item is unread
      expect((result.current.items[0] as NotificationItem).isRead).toBe(false);

      await act(async () => {
        try {
          await result.current.markAsRead("notif-1");
        } catch {
          // Expected to throw
        }
      });

      // Should revert back to unread
      await waitFor(() => {
        expect((result.current.items[0] as NotificationItem).isRead).toBe(false);
      });
    });
  });

  describe("Mark All as Read", () => {
    /**
     * Requirement: BLS-11-03
     * "Should mark all notifications as read"
     */
    it("should mark all notifications as read", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(markAllNotificationsRead).toHaveBeenCalled();
    });

    /**
     * Requirement: BLS-11-03
     * "Should update all items as read optimistically"
     */
    it("should update all items as read optimistically", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Some items are unread
      const unreadItems = (result.current.items as NotificationItem[]).filter(
        (item) => !item.isRead
      );
      expect(unreadItems.length).toBeGreaterThan(0);

      act(() => {
        result.current.markAllAsRead();
      });

      // All items should be marked as read immediately
      await waitFor(() => {
        const stillUnread = (result.current.items as NotificationItem[]).filter(
          (item) => !item.isRead
        );
        expect(stillUnread.length).toBe(0);
      });
    });

    /**
     * Requirement: BLS-11-03
     * "Should set bell count to 0"
     */
    it("should set bell count to 0 after marking all as read", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markAllAsRead();
      });

      expect(result.current.bellCount.total).toBe(0);
    });
  });

  describe("Bell Badge Count", () => {
    /**
     * Requirement: NOTIF-R00.badge
     * "Should fetch bell badge count"
     */
    it("should fetch bell badge count on mount", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getBellUnreadCount).toHaveBeenCalled();
      expect(result.current.bellCount).toEqual({
        total: 2,
        byCategory: {
          applications: 0,
          appointments: 1,
          system: 1,
        },
      });
    });

    /**
     * Requirement: NOTIF-R00.badge
     * "Should expose category counts"
     */
    it("should expose category counts for filter tabs", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.bellCount.byCategory.applications).toBe(0);
      expect(result.current.bellCount.byCategory.appointments).toBe(1);
      expect(result.current.bellCount.byCategory.system).toBe(1);
    });
  });

  describe("Refresh", () => {
    /**
     * Requirement: NOTIF-R01.refresh
     * "Should refetch notifications on refresh"
     */
    it("should refetch notifications on refresh", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Hook uses getFilteredNotifications for fetching
      const initialCallCount = vi.mocked(getFilteredNotifications).mock.calls.length;

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(vi.mocked(getFilteredNotifications).mock.calls.length).toBe(initialCallCount + 1);
      });
    });

    /**
     * Requirement: NOTIF-R01.refresh
     * "Should reset pagination on refresh"
     */
    it("should reset pagination on refresh", async () => {
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.refresh();
      });

      // Hook uses getFilteredNotifications for fetching
      await waitFor(() => {
        expect(getFilteredNotifications).toHaveBeenLastCalledWith(
          expect.objectContaining({ cursor: null })
        );
      });
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: NOTIF-R01.error
     * "Should expose error state"
     */
    it("should expose error state on failure", async () => {
      const error = new Error("Failed to fetch");
      // Hook uses getFilteredNotifications for fetching
      vi.mocked(getFilteredNotifications).mockRejectedValue(error);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe("Failed to fetch");
    });

    /**
     * Requirement: NOTIF-R01.error
     * "Should clear error on successful retry"
     */
    it("should clear error on successful retry", async () => {
      // Hook uses getFilteredNotifications for fetching
      vi.mocked(getFilteredNotifications)
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce({
          items: mockNotifications,
          filter: "all",
          hasMore: false,
          cursor: null,
        });

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
