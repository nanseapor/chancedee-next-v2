import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { markMessagesAsRead } from "@/lib/database/actions/chat-messages";

// Mock dependencies
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    getByFilter: vi.fn(),
    batchUpdate: vi.fn(),
  },
}));

vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";

describe("markMessagesAsRead", () => {
  const mockSessionUser = {
    uid: "user-123",
    candidateId: "candidate-123",
    companyId: null,
  };

  const mockRoom = {
    id: "room-123",
    candidateId: "candidate-123",
    companyId: "company-456",
    unreadCount: 5,
  };

  const mockUnreadMessages = [
    {
      messageId: "msg-1",
      roomId: "room-123",
      senderId: "company-456",
      unread: ["user-123"],
      message: "Hello",
      type: "text",
      timestamp: Date.now() - 1000,
    },
    {
      messageId: "msg-2",
      roomId: "room-123",
      senderId: "company-456",
      unread: ["user-123"],
      message: "Are you there?",
      type: "text",
      timestamp: Date.now() - 500,
    },
    {
      messageId: "msg-3",
      roomId: "room-123",
      senderId: "company-456",
      unread: ["user-123"],
      message: "Please respond",
      type: "text",
      timestamp: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockSessionUser);
    vi.mocked(chatRepository.getById).mockResolvedValue(mockRoom);
    vi.mocked(messagesRepository.getByFilter).mockResolvedValue(
      mockUnreadMessages
    );
    vi.mocked(messagesRepository.batchUpdate).mockResolvedValue(undefined);
    vi.mocked(chatRepository.update).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should remove userId from unread array", async () => {
    await markMessagesAsRead({
      roomId: "room-123",
    });

    expect(messagesRepository.batchUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          messageId: "msg-1",
          unread: [],
        }),
        expect.objectContaining({
          messageId: "msg-2",
          unread: [],
        }),
        expect.objectContaining({
          messageId: "msg-3",
          unread: [],
        }),
      ]),
      "user-123"
    );
  });

  it("should update multiple messages in batch", async () => {
    await markMessagesAsRead({
      roomId: "room-123",
    });

    expect(messagesRepository.batchUpdate).toHaveBeenCalledTimes(1);
    const batchedMessages =
      vi.mocked(messagesRepository.batchUpdate).mock.calls[0][0];
    expect(batchedMessages).toHaveLength(3);
  });

  it("should only update messages where user is in unread", async () => {
    // Filter query only returns messages where user is in unread array
    // So we simulate getByFilter only returning messages that match
    vi.mocked(messagesRepository.getByFilter).mockResolvedValue([
      {
        messageId: "msg-1",
        roomId: "room-123",
        senderId: "company-456",
        unread: ["user-123"],
        message: "Hello",
        type: "text",
        timestamp: Date.now() - 1000,
      },
      // msg-2 wouldn't be returned by filter since user not in unread
    ]);

    await markMessagesAsRead({
      roomId: "room-123",
    });

    // Only msg-1 should be updated
    expect(messagesRepository.batchUpdate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          messageId: "msg-1",
          unread: [], // user removed from unread array
        }),
      ]),
      "user-123"
    );

    const batchedMessages =
      vi.mocked(messagesRepository.batchUpdate).mock.calls[0][0];
    expect(batchedMessages).toHaveLength(1);
  });

  it("should not fail if already marked read", async () => {
    // No unread messages
    vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);

    await expect(
      markMessagesAsRead({
        roomId: "room-123",
      })
    ).resolves.not.toThrow();

    // batchUpdate should not be called if nothing to update
    expect(messagesRepository.batchUpdate).not.toHaveBeenCalled();
  });

  it("should not update room (unreadCount handled separately)", async () => {
    // Note: Current implementation only updates messages, not room
    // Room unreadCount could be handled by a separate function or UI-side calculation
    await markMessagesAsRead({
      roomId: "room-123",
    });

    // Room update is not called by this function
    expect(chatRepository.update).not.toHaveBeenCalled();
  });

  it("should throw UNAUTHORIZED when no session", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    await expect(
      markMessagesAsRead({
        roomId: "room-123",
      })
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("should throw NOT_PARTICIPANT if user not in room", async () => {
    vi.mocked(chatRepository.getById).mockResolvedValue({
      ...mockRoom,
      candidateId: "other-candidate",
      companyId: "other-company",
    });

    await expect(
      markMessagesAsRead({
        roomId: "room-123",
      })
    ).rejects.toThrow("NOT_PARTICIPANT");
  });

  it("should throw ROOM_NOT_FOUND for invalid roomId", async () => {
    vi.mocked(chatRepository.getById).mockResolvedValue(null);

    await expect(
      markMessagesAsRead({
        roomId: "invalid-room",
      })
    ).rejects.toThrow("ROOM_NOT_FOUND");
  });
});
