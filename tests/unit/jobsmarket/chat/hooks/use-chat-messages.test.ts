import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatMessages } from "@/hooks/jobsmarket/chat/use-chat-messages";

// Mock Firebase client SDK with factory function
vi.mock("firebase/firestore", () => {
  // Create mock Timestamp class inside factory
  class MockTimestamp {
    _seconds: number;
    _nanoseconds: number;

    constructor(seconds: number, nanoseconds = 0) {
      this._seconds = seconds;
      this._nanoseconds = nanoseconds;
    }

    toMillis(): number {
      return this._seconds * 1000;
    }

    static fromMillis(ms: number): MockTimestamp {
      return new MockTimestamp(Math.floor(ms / 1000), 0);
    }
  }

  return {
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    Timestamp: MockTimestamp,
  };
});

// Mock server actions
vi.mock("@/lib/database/actions/chat-messages", () => ({
  sendMessageFirestore: vi.fn(),
  loadMessageHistory: vi.fn(),
  markMessagesAsRead: vi.fn(),
}));

// Mock Firebase app
vi.mock("@/lib/firebase/client", () => ({
  getFirebaseFirestore: vi.fn(() => ({})),
}));

import { onSnapshot } from "firebase/firestore";
import {
  sendMessageFirestore,
  loadMessageHistory,
  markMessagesAsRead,
} from "@/lib/database/actions/chat-messages";

describe("useChatMessages", () => {
  const mockMessages = [
    {
      messageId: "msg-1",
      roomId: "room-123",
      senderId: "user-123",
      message: "Hello",
      type: "text",
      timestamp: Date.now() - 1000,
      unread: [],
    },
    {
      messageId: "msg-2",
      roomId: "room-123",
      senderId: "company-456",
      message: "Hi there",
      type: "text",
      timestamp: Date.now(),
      unread: ["user-123"],
    },
  ];

  let unsubscribeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    unsubscribeMock = vi.fn();

    // Default mock for onSnapshot
    vi.mocked(onSnapshot).mockImplementation((query, callback) => {
      // Simulate initial load
      if (typeof callback === "function") {
        setTimeout(() => {
          callback({
            docs: mockMessages.map((msg) => ({
              id: msg.messageId,
              data: () => msg,
            })),
          });
        }, 0);
      }
      return unsubscribeMock;
    });

    vi.mocked(loadMessageHistory).mockResolvedValue({
      messages: mockMessages,
      hasMore: false,
      cursor: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("subscription", () => {
    it("should subscribe to room messages on mount", async () => {
      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalled();
      });
    });

    it("should unsubscribe on unmount", async () => {
      const { unmount } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it("should handle new messages in real-time", async () => {
      let snapshotCallback: ((snapshot: unknown) => void) | undefined;
      vi.mocked(onSnapshot).mockImplementation((query, callback) => {
        snapshotCallback = callback as (snapshot: unknown) => void;
        // Initial empty
        setTimeout(() => {
          snapshotCallback?.({
            docs: [],
          });
        }, 0);
        return unsubscribeMock;
      });

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate new message arriving
      act(() => {
        snapshotCallback?.({
          docs: [
            {
              id: "msg-new",
              data: () => ({
                messageId: "msg-new",
                roomId: "room-123",
                senderId: "company-456",
                message: "New message!",
                type: "text",
                timestamp: Date.now(),
                unread: ["user-123"],
              }),
            },
          ],
        });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].message).toBe("New message!");
      });
    });

    it("should handle message updates in real-time", async () => {
      let snapshotCallback: ((snapshot: unknown) => void) | undefined;
      vi.mocked(onSnapshot).mockImplementation((query, callback) => {
        snapshotCallback = callback as (snapshot: unknown) => void;
        setTimeout(() => {
          snapshotCallback?.({
            docs: mockMessages.map((msg) => ({
              id: msg.messageId,
              data: () => msg,
            })),
          });
        }, 0);
        return unsubscribeMock;
      });

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Simulate message update (e.g., read status change)
      act(() => {
        snapshotCallback?.({
          docs: mockMessages.map((msg) => ({
            id: msg.messageId,
            data: () => ({
              ...msg,
              unread: [], // All messages now read
            }),
          })),
        });
      });

      await waitFor(() => {
        expect(result.current.messages[1].unread).toEqual([]);
      });
    });
  });

  describe("state", () => {
    it("should return loading true initially", () => {
      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it("should return messages after load", async () => {
      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.messages).toHaveLength(2);
      });
    });

    it("should return error on subscription failure", async () => {
      vi.mocked(onSnapshot).mockImplementation(() => {
        throw new Error("Subscription failed");
      });

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toBe("Subscription failed");
      });
    });

    it("should return isConnected status", async () => {
      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });
  });

  describe("actions", () => {
    it("should provide sendMessage function", async () => {
      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(typeof result.current.sendMessage).toBe("function");
      });
    });

    it("should provide loadMore function", async () => {
      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(typeof result.current.loadMore).toBe("function");
      });
    });

    it("should provide markAsRead function", async () => {
      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(typeof result.current.markAsRead).toBe("function");
      });
    });
  });

  describe("optimistic updates", () => {
    it("should add message optimistically before server confirm", async () => {
      vi.mocked(sendMessageFirestore).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ messageId: "msg-new" }), 1000))
      );

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCount = result.current.messages.length;

      act(() => {
        result.current.sendMessage("New optimistic message");
      });

      // Message should appear immediately
      await waitFor(() => {
        expect(result.current.messages.length).toBe(initialCount + 1);
        expect(result.current.messages[0].message).toBe("New optimistic message");
        expect(result.current.messages[0].status).toBe("sending");
      });
    });

    it("should update message status on server confirm", async () => {
      vi.mocked(sendMessageFirestore).mockResolvedValue({ messageId: "msg-confirmed" });

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.sendMessage("Confirmed message");
      });

      await waitFor(() => {
        const sentMessage = result.current.messages.find(
          (m) => m.message === "Confirmed message"
        );
        expect(sentMessage?.status).toBe("sent");
      });
    });

    it("should rollback on server error", async () => {
      vi.mocked(sendMessageFirestore).mockRejectedValue(new Error("Send failed"));

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.sendMessage("Failed message");
        } catch {
          // Expected to fail
        }
      });

      await waitFor(() => {
        const failedMessage = result.current.messages.find(
          (m) => m.message === "Failed message"
        );
        expect(failedMessage?.status).toBe("failed");
      });
    });
  });

  describe("pagination", () => {
    it("should load more messages on loadMore call", async () => {
      vi.mocked(loadMessageHistory)
        .mockResolvedValueOnce({
          messages: mockMessages,
          hasMore: true,
          cursor: "cursor-1",
        })
        .mockResolvedValueOnce({
          messages: [
            {
              messageId: "msg-old",
              roomId: "room-123",
              senderId: "user-123",
              message: "Old message",
              type: "text",
              timestamp: Date.now() - 10000,
              unread: [],
            },
          ],
          hasMore: false,
          cursor: null,
        });

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.hasMore).toBe(true);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(loadMessageHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: "cursor-1",
        })
      );
    });

    it("should append older messages to list", async () => {
      vi.mocked(loadMessageHistory)
        .mockResolvedValueOnce({
          messages: mockMessages,
          hasMore: true,
          cursor: "cursor-1",
        })
        .mockResolvedValueOnce({
          messages: [
            {
              messageId: "msg-old",
              roomId: "room-123",
              senderId: "user-123",
              message: "Old message",
              type: "text",
              timestamp: Date.now() - 10000,
              unread: [],
            },
          ],
          hasMore: false,
          cursor: null,
        });

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(3);
      });
    });

    it("should set hasMore to false when exhausted", async () => {
      vi.mocked(loadMessageHistory).mockResolvedValue({
        messages: mockMessages,
        hasMore: false,
        cursor: null,
      });

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });
    });
  });

  describe("mark as read", () => {
    it("should call markMessagesAsRead action", async () => {
      vi.mocked(markMessagesAsRead).mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useChatMessages({
          roomId: "room-123",
          userId: "user-123",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markAsRead();
      });

      expect(markMessagesAsRead).toHaveBeenCalledWith({
        roomId: "room-123",
      });
    });
  });
});
