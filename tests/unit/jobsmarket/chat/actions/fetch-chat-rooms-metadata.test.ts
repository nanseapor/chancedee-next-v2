/**
 * Unit Tests for fetchChatRoomsMetadata Server Action
 * Per CHAT-R01 RIS and BLS-06-01
 *
 * RED Phase: These tests should FAIL because the action doesn't exist yet.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// This import will fail in RED phase - action doesn't exist yet
import { fetchChatRoomsMetadata } from "@/lib/database/actions/chat-rooms";

// Mock Firebase auth session
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

// Mock chat repository
vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getByFilter: vi.fn(),
  },
}));

// Mock messages repository
vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    getByFilter: vi.fn(),
  },
}));

// Mock candidate information action
vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateInformationGetById: vi.fn(),
}));

// Mock company information action
vi.mock("@/lib/database/actions/company-information", () => ({
  webCompanyInformationGetById: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";

describe("fetchChatRoomsMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("for candidate role", () => {
    const mockCandidateSession = {
      uid: "candidate-123",
      candidateId: "candidate-123",
      companyId: null,
    };

    const mockChatRooms = [
      {
        id: "room-1",
        candidateId: "candidate-123",
        companyId: "company-456",
        hrId: "hr-789",
        candidateName: "Test Candidate",
        companyName: "Test Company",
        hrName: "Test HR",
        lastMessage: "สวัสดีครับ",
        lastupdate: Date.now(),
      },
      {
        id: "room-2",
        candidateId: "candidate-123",
        companyId: "company-111",
        hrId: "hr-222",
        candidateName: "Test Candidate",
        companyName: "Another Company",
        hrName: "Another HR",
        lastMessage: "ขอบคุณครับ",
        lastupdate: Date.now() - 1000,
      },
    ];

    beforeEach(() => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCandidateSession);
    });

    it("should return rooms where user is candidate", async () => {
      vi.mocked(chatRepository.getByFilter).mockResolvedValue(mockChatRooms);
      vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);
      vi.mocked(webCompanyInformationGetById).mockResolvedValue({
        uid: "company-456",
        companyName: "Test Company",
        companyLogoURL: "https://example.com/logo.png",
      });

      const result = await fetchChatRoomsMetadata({ navBar: "candidate" });

      expect(result.rooms).toHaveLength(2);
      expect(result.rooms[0].otherPartyName).toBe("Test Company");
      expect(result.currentUser).toBeDefined();
      expect(result.currentUser.role).toBe("candidate");
    });

    it("should exclude corrupted rooms (candidateId === companyId)", async () => {
      const roomsWithCorrupted = [
        ...mockChatRooms,
        {
          id: "room-corrupted",
          candidateId: "same-id",
          companyId: "same-id", // Corrupted: same as candidateId
          hrId: "hr-xxx",
          candidateName: "Corrupted",
          companyName: "Corrupted",
          hrName: "Corrupted",
          lastMessage: "test",
          lastupdate: Date.now(),
        },
      ];

      vi.mocked(chatRepository.getByFilter).mockResolvedValue(roomsWithCorrupted);
      vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);

      const result = await fetchChatRoomsMetadata({ navBar: "candidate" });

      // Should filter out the corrupted room
      expect(result.rooms).toHaveLength(2);
      expect(result.rooms.find((r) => r.uid === "room-corrupted")).toBeUndefined();
    });

    it("should return currentUser context", async () => {
      vi.mocked(chatRepository.getByFilter).mockResolvedValue(mockChatRooms);
      vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);

      const result = await fetchChatRoomsMetadata({ navBar: "candidate" });

      expect(result.currentUser).toEqual({
        id: "candidate-123",
        role: "candidate",
      });
    });

    it("should calculate unreadCount from messages", async () => {
      vi.mocked(chatRepository.getByFilter).mockResolvedValue([mockChatRooms[0]]);

      // Mock messages that would be returned by the filter
      // The implementation queries for messages where unread array-contains current user
      // So we mock only the messages that would match that filter (2 messages)
      const mockUnreadMessages = [
        {
          messageId: "msg-1",
          roomId: "room-1",
          senderId: "company-456",
          unread: ["candidate-123"], // Current user hasn't read
          timestamp: Date.now(),
        },
        {
          messageId: "msg-2",
          roomId: "room-1",
          senderId: "company-456",
          unread: ["candidate-123"], // Current user hasn't read
          timestamp: Date.now(),
        },
      ];

      vi.mocked(messagesRepository.getByFilter).mockResolvedValue(mockUnreadMessages);

      const result = await fetchChatRoomsMetadata({ navBar: "candidate" });

      expect(result.rooms[0].unreadCount).toBe(2);
    });

    it("should detect hasPendingAppointment", async () => {
      vi.mocked(chatRepository.getByFilter).mockResolvedValue([mockChatRooms[0]]);

      // Mock messages with pending interview
      const mockMessages = [
        {
          messageId: "msg-1",
          roomId: "room-1",
          senderId: "company-456",
          type: "interview",
          interviewStatus: "pending",
          interviewDate: "2025-02-01",
          timestamp: Date.now(),
          unread: [],
        },
      ];

      vi.mocked(messagesRepository.getByFilter).mockResolvedValue(mockMessages);

      const result = await fetchChatRoomsMetadata({ navBar: "candidate" });

      expect(result.rooms[0].hasPendingAppointment).toBe(true);
    });

    it("should return empty array when no rooms exist", async () => {
      vi.mocked(chatRepository.getByFilter).mockResolvedValue([]);

      const result = await fetchChatRoomsMetadata({ navBar: "candidate" });

      expect(result.rooms).toEqual([]);
    });
  });

  describe("for company role", () => {
    const mockCompanySession = {
      uid: "hr-user-123",
      candidateId: null,
      companyId: "company-456",
    };

    const mockChatRooms = [
      {
        id: "room-1",
        candidateId: "candidate-111",
        companyId: "company-456",
        hrId: "hr-user-123",
        candidateName: "สมชาย ใจดี",
        companyName: "Test Company",
        hrName: "Test HR",
        lastMessage: "สนใจตำแหน่งนี้ครับ",
        lastupdate: Date.now(),
      },
    ];

    beforeEach(() => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCompanySession);
    });

    it("should return rooms where user is company", async () => {
      vi.mocked(chatRepository.getByFilter).mockResolvedValue(mockChatRooms);
      vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        uid: "candidate-111",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        resumePhotoURL: "https://example.com/photo.jpg",
      });

      const result = await fetchChatRoomsMetadata({ navBar: "company" });

      expect(result.rooms).toHaveLength(1);
      expect(result.currentUser.role).toBe("company");
    });

    it("should show candidateName as otherPartyName", async () => {
      vi.mocked(chatRepository.getByFilter).mockResolvedValue(mockChatRooms);
      vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        uid: "candidate-111",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        resumePhotoURL: null,
      });

      const result = await fetchChatRoomsMetadata({ navBar: "company" });

      expect(result.rooms[0].otherPartyName).toBe("สมชาย ใจดี");
    });

    it("should show candidatePhoto as otherPartyPhoto", async () => {
      const mockPhotoUrl = "https://example.com/candidate-photo.jpg";

      vi.mocked(chatRepository.getByFilter).mockResolvedValue(mockChatRooms);
      vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        uid: "candidate-111",
        firstnameTH: "สมชาย",
        lastnameTH: "ใจดี",
        resumePhotoURL: mockPhotoUrl,
      });

      const result = await fetchChatRoomsMetadata({ navBar: "company" });

      expect(result.rooms[0].otherPartyPhoto).toBe(mockPhotoUrl);
    });
  });

  describe("error handling", () => {
    it("should throw UNAUTHORIZED when no session", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(fetchChatRoomsMetadata({ navBar: "candidate" })).rejects.toThrow(
        "UNAUTHORIZED"
      );
    });

    it("should throw INVALID_ROLE for invalid navBar param", async () => {
      vi.mocked(getSessionUser).mockResolvedValue({
        uid: "user-123",
        candidateId: "candidate-123",
        companyId: null,
      });

      await expect(
        // @ts-expect-error Testing invalid input
        fetchChatRoomsMetadata({ navBar: "invalid" })
      ).rejects.toThrow("INVALID_ROLE");
    });
  });

  describe("sorting", () => {
    it("should sort rooms by lastMessageTime descending", async () => {
      const now = Date.now();
      const mockRooms = [
        {
          id: "room-old",
          candidateId: "candidate-123",
          companyId: "company-1",
          hrId: "hr-1",
          candidateName: "Test",
          companyName: "Old Company",
          hrName: "HR",
          lastMessage: "old message",
          lastupdate: now - 10000, // 10 seconds ago
        },
        {
          id: "room-new",
          candidateId: "candidate-123",
          companyId: "company-2",
          hrId: "hr-2",
          candidateName: "Test",
          companyName: "New Company",
          hrName: "HR",
          lastMessage: "new message",
          lastupdate: now, // Just now
        },
      ];

      vi.mocked(getSessionUser).mockResolvedValue({
        uid: "candidate-123",
        candidateId: "candidate-123",
        companyId: null,
      });
      vi.mocked(chatRepository.getByFilter).mockResolvedValue(mockRooms);
      vi.mocked(messagesRepository.getByFilter).mockResolvedValue([]);

      const result = await fetchChatRoomsMetadata({ navBar: "candidate" });

      // Newest should be first
      expect(result.rooms[0].uid).toBe("room-new");
      expect(result.rooms[1].uid).toBe("room-old");
    });
  });
});
