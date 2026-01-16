"use client";

/**
 * NotificationsClient Component - NOTIF-R01
 *
 * Client component for the notifications page.
 * Handles filtering, pagination, and mark-as-read functionality.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { FilterTabs } from "@/components/jobsmarket/notifications/FilterTabs";
import { NotificationItemCard } from "@/components/jobsmarket/notifications/NotificationItemCard";
import { GroupedRoomCard } from "@/components/jobsmarket/notifications/GroupedRoomCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/jobsmarket/notifications/use-notifications";
import type { NotificationItem, GroupedRoomItem } from "@/types/notification.types";

function NotificationSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      data-testid="notification-empty-state"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <Bell className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีการแจ้งเตือน</h3>
      <p className="text-sm text-gray-500">
        เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่
      </p>
    </div>
  );
}

export function NotificationsClient() {
  const router = useRouter();
  const {
    items,
    isLoading,
    hasMore,
    filter,
    bellCount,
    setFilter,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      // Navigate to chat room
      router.push(`/chat/${notification.roomId}`);
    },
    [router]
  );

  const handleRoomClick = useCallback(
    (roomId: string) => {
      router.push(`/chat/${roomId}`);
    },
    [router]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [markAllAsRead]);

  const isMessagesFilter = filter === "messages";
  const hasUnread = bellCount.total > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">การแจ้งเตือน</h1>
            <div className="flex items-center gap-3">
              {/* Bell Badge */}
              {hasUnread && (
                <span
                  data-testid="bell-badge"
                  className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-sm font-medium rounded-full bg-secondary-500 text-white"
                >
                  {bellCount.total > 99 ? "99+" : bellCount.total}
                </span>
              )}

              {/* Mark all as read button */}
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-secondary-600 hover:text-secondary-800"
                >
                  ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <FilterTabs
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={bellCount.byCategory}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {isLoading && items.length === 0 ? (
          // Loading skeletons
          <div className="bg-white">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <EmptyState />
        ) : (
          // Notification list
          <div className="bg-white divide-y divide-gray-100">
            {isMessagesFilter
              ? // Render GroupedRoomCards for messages filter
                (items as GroupedRoomItem[]).map((room) => (
                  <GroupedRoomCard
                    key={room.roomId}
                    room={room}
                    onClick={handleRoomClick}
                  />
                ))
              : // Render NotificationItemCards for other filters
                (items as NotificationItem[]).map((notification) => (
                  <NotificationItemCard
                    key={notification.uid}
                    notification={notification}
                    onClick={handleNotificationClick}
                    onMarkAsRead={markAsRead}
                  />
                ))}

            {/* Load more button */}
            {hasMore && (
              <div className="p-4 text-center">
                <Button
                  variant="ghost"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="text-secondary-600"
                >
                  {isLoading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsClient;
