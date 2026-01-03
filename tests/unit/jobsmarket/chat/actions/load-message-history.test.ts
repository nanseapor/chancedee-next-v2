import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadMessageHistory } from "@/lib/database/actions/chat-messages";

// Mock dependencies
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    getByRoomId: vi.fn(),
    getByRoomIdPaginated: vi.fn(),
  },
}));

vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getById: vi.fn(),
  },
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";

describe("loadMessageHistory", () => {
  const mockSessionUser = {
    uid: "user-123",
    candidateId: "candidate-123",
    companyId: null,
  };

  const mockRoom = {
    id: "room-123",
    candidateId: "candidate-123",
    companyId: "company-456",
  };

  const generateMockMessages = (count: number, startTimestamp: number = Date.now()) => {
    return Array.from({ length: count }, (_, i) => ({
      messageId: `msg-${i + 1}`,
      roomId: "room-123",
      senderId: i % 2 === 0 ? "user-123" : "company-456",
      message: `Message ${i + 1}`,
      type: "text",
      timestamp: startTimestamp - i * 1000,
      unread: [],
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockSessionUser);
    vi.mocked(chatRepository.getById).mockResolvedValue(mockRoom);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial load", () => {
    it("should return latest 50 messages", async () => {
      const mockMessages = generateMockMessages(50);
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: mockMessages,
        hasMore: true,
        cursor: mockMessages[49].timestamp.toString(),
      });

      const result = await loadMessageHistory({
        roomId: "room-123",
      });

      expect(result.messages).toHaveLength(50);
      expect(messagesRepository.getByRoomIdPaginated).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          limit: 50,
        })
      );
    });

    it("should order by timestamp descending", async () => {
      const mockMessages = generateMockMessages(10);
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: mockMessages,
        hasMore: false,
        cursor: null,
      });

      const result = await loadMessageHistory({
        roomId: "room-123",
      });

      // First message should have highest timestamp (newest)
      expect(result.messages[0].timestamp).toBeGreaterThan(
        result.messages[result.messages.length - 1].timestamp
      );
    });

    it("should include all message types", async () => {
      const mixedMessages = [
        {
          messageId: "msg-1",
          roomId: "room-123",
          senderId: "user-123",
          message: "Hello",
          type: "text",
          timestamp: Date.now(),
          unread: [],
        },
        {
          messageId: "msg-2",
          roomId: "room-123",
          senderId: "company-456",
          message: "",
          type: "image",
          timestamp: Date.now() - 1000,
          attachments: "https://example.com/image.jpg",
          unread: [],
        },
        {
          messageId: "msg-3",
          roomId: "room-123",
          senderId: "company-456",
          message: "",
          type: "file",
          timestamp: Date.now() - 2000,
          attachments: "https://example.com/doc.pdf",
          unread: [],
        },
        {
          messageId: "msg-4",
          roomId: "room-123",
          senderId: "system",
          message: "Interview scheduled",
          type: "interview",
          timestamp: Date.now() - 3000,
          unread: [],
        },
      ];
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: mixedMessages,
        hasMore: false,
        cursor: null,
      });

      const result = await loadMessageHistory({
        roomId: "room-123",
      });

      const types = result.messages.map((m) => m.type);
      expect(types).toContain("text");
      expect(types).toContain("image");
      expect(types).toContain("file");
      expect(types).toContain("interview");
    });

    it("should return hasMore flag", async () => {
      const mockMessages = generateMockMessages(50);
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: mockMessages,
        hasMore: true,
        cursor: mockMessages[49].timestamp.toString(),
      });

      const result = await loadMessageHistory({
        roomId: "room-123",
      });

      expect(result.hasMore).toBe(true);
    });

    it("should return cursor for pagination", async () => {
      const mockMessages = generateMockMessages(50);
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: mockMessages,
        hasMore: true,
        cursor: "1704067200000",
      });

      const result = await loadMessageHistory({
        roomId: "room-123",
      });

      expect(result.cursor).toBe("1704067200000");
    });
  });

  describe("pagination", () => {
    it("should load older messages with cursor", async () => {
      const olderMessages = generateMockMessages(30, Date.now() - 50000);
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: olderMessages,
        hasMore: true,
        cursor: olderMessages[29].timestamp.toString(),
      });

      const result = await loadMessageHistory({
        roomId: "room-123",
        cursor: "1704067200000",
      });

      expect(messagesRepository.getByRoomIdPaginated).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          cursor: "1704067200000",
        })
      );
      expect(result.messages).toHaveLength(30);
    });

    it("should return 30 messages per page", async () => {
      const olderMessages = generateMockMessages(30);
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: olderMessages,
        hasMore: true,
        cursor: olderMessages[29].timestamp.toString(),
      });

      await loadMessageHistory({
        roomId: "room-123",
        cursor: "1704067200000",
      });

      expect(messagesRepository.getByRoomIdPaginated).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          limit: 30,
        })
      );
    });

    it("should return hasMore false when no more", async () => {
      const lastMessages = generateMockMessages(10);
      vi.mocked(messagesRepository.getByRoomIdPaginated).mockResolvedValue({
        messages: lastMessages,
        hasMore: false,
        cursor: null,
      });

      const result = await loadMessageHistory({
        roomId: "room-123",
        cursor: "1704067200000",
      });

      expect(result.hasMore).toBe(false);
      expect(result.cursor).toBeNull();
    });
  });

  describe("authorization", () => {
    it("should throw UNAUTHORIZED when no session", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(
        loadMessageHistory({
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
        loadMessageHistory({
          roomId: "room-123",
        })
      ).rejects.toThrow("NOT_PARTICIPANT");
    });

    it("should throw ROOM_NOT_FOUND for invalid roomId", async () => {
      vi.mocked(chatRepository.getById).mockResolvedValue(null);

      await expect(
        loadMessageHistory({
          roomId: "invalid-room",
        })
      ).rejects.toThrow("ROOM_NOT_FOUND");
    });
  });
});
