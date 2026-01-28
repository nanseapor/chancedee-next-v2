"use client";

/**
 * useNotifications Hook - NOTIF-R01
 *
 * Hook for managing notification state and actions.
 * Fetches notifications, handles filtering, pagination, and mark-as-read actions.
 */

import { useState, useCallback, useEffect, useRef } from "react";

import {
  fetchBellNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getBellUnreadCount,
  getFilteredNotifications,
} from "@/lib/database/actions/notifications";
import type {
  NotificationItem,
  GroupedRoomItem,
  NotificationFilterCategory,
  BellBadgeCount,
  UseNotificationsReturn,
} from "@/types/notification.types";

export interface UseNotificationsOptions {
  /** Initial filter to use */
  initialFilter?: NotificationFilterCategory;
  /** Number of items to fetch per page */
  pageSize?: number;
}

/**
 * Hook for managing notifications
 *
 * @example
 * const {
 *   items,
 *   isLoading,
 *   hasMore,
 *   filter,
 *   bellCount,
 *   setFilter,
 *   loadMore,
 *   markAsRead,
 *   markAllAsRead,
 *   refresh,
 * } = useNotifications();
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { initialFilter = "all", pageSize = 20 } = options;

  // State
  const [items, setItems] = useState<NotificationItem[] | GroupedRoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilterState] = useState<NotificationFilterCategory>(initialFilter);
  const [bellCount, setBellCount] = useState<BellBadgeCount>({
    total: 0,
    byCategory: { applications: 0, appointments: 0, system: 0 },
  });
  const [error, setError] = useState<Error | null>(null);

  // Refs for pagination cursor
  const cursorRef = useRef<string | null>(null);
  const isLoadingMoreRef = useRef(false);

  /**
   * Fetch notifications based on current filter
   */
  const fetchNotifications = useCallback(
    async (resetCursor = true) => {
      setIsLoading(true);
      setError(null);

      if (resetCursor) {
        cursorRef.current = null;
      }

      try {
        const response = await getFilteredNotifications({
          filter,
          cursor: cursorRef.current,
          limit: pageSize,
        });

        if (resetCursor) {
          setItems(response.items);
        } else {
          // Append for pagination
          setItems((prev) => [...prev, ...response.items] as typeof prev);
        }

        setHasMore(response.hasMore);
        cursorRef.current = response.cursor;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch notifications"));
        if (resetCursor) {
          setItems([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filter, pageSize]
  );

  /**
   * Fetch bell badge count
   */
  const fetchBellCount = useCallback(async () => {
    try {
      const count = await getBellUnreadCount();
      setBellCount(count);
    } catch (err) {
      console.error("Failed to fetch bell count:", err);
    }
  }, []);

  /**
   * Load more items (pagination)
   */
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      fetchNotifications(false).finally(() => {
        isLoadingMoreRef.current = false;
      });
    }
  }, [hasMore, fetchNotifications]);

  /**
   * Change filter
   */
  const setFilter = useCallback((newFilter: NotificationFilterCategory) => {
    setFilterState(newFilter);
    cursorRef.current = null;
    setItems([]);
    setIsLoading(true);
  }, []);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(
    async (messageId: string) => {
      // Optimistic update
      setItems((prev) => {
        if (filter === "messages") {
          // Can't optimistically update grouped rooms
          return prev;
        }
        return (prev as NotificationItem[]).map((item) =>
          item.uid === messageId ? { ...item, isRead: true } : item
        );
      });

      // Optimistic bell count update
      setBellCount((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));

      try {
        const result = await markNotificationRead({ messageId });
        setBellCount((prev) => ({
          ...prev,
          total: result.newUnreadCount,
        }));
      } catch (err) {
        // Revert optimistic update on error
        fetchNotifications(true);
        fetchBellCount();
        throw err;
      }
    },
    [filter, fetchNotifications, fetchBellCount]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    // Optimistic update - mark all as read
    setItems((prev) => {
      if (filter === "messages") {
        return prev;
      }
      return (prev as NotificationItem[]).map((item) => ({
        ...item,
        isRead: true,
      }));
    });

    // Optimistic bell count update
    setBellCount({
      total: 0,
      byCategory: { applications: 0, appointments: 0, system: 0 },
    });

    try {
      await markAllNotificationsRead();
    } catch (err) {
      // Revert on error
      fetchNotifications(true);
      fetchBellCount();
      throw err;
    }
  }, [filter, fetchNotifications, fetchBellCount]);

  /**
   * Refresh notifications
   */
  const refresh = useCallback(() => {
    cursorRef.current = null;
    fetchNotifications(true);
    fetchBellCount();
  }, [fetchNotifications, fetchBellCount]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(true);
    fetchBellCount();
  }, [fetchNotifications, fetchBellCount]);

  // Refetch when filter changes
  useEffect(() => {
    fetchNotifications(true);
  }, [filter, fetchNotifications]);

  return {
    items,
    isLoading,
    hasMore,
    filter,
    bellCount,
    error,
    setFilter,
    loadMore,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}

export default useNotifications;
