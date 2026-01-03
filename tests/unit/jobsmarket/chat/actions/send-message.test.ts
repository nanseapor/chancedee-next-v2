import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendMessageFirestore } from "@/lib/database/actions/chat-messages";

// Mock dependencies
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    create: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateInformationGetById: vi.fn(),
}));

vi.mock("@/lib/database/actions/company-information", () => ({
  webCompanyInformationGetById: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";

describe("sendMessageFirestore", () => {
  const mockSessionUser = {
    uid: "user-123",
    candidateId: "candidate-123",
    companyId: null,
  };

  const mockRoom = {
    id: "room-123",
    candidateId: "candidate-123",
    companyId: "company-456",
    candidateName: "Test Candidate",
    companyName: "Test Company",
    lastMessage: null,
    lastupdate: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockSessionUser);
    vi.mocked(chatRepository.getById).mockResolvedValue(mockRoom);
    // Mock candidate info for sender display name
    vi.mocked(webCandidateInformationGetById).mockResolvedValue({
      uid: "candidate-123",
      firstnameTH: "Test",
      lastnameTH: "Candidate",
      resumePhotoURL: "https://example.com/photo.jpg",
    } as ReturnType<typeof webCandidateInformationGetById> extends Promise<infer T> ? T : never);
    vi.mocked(webCompanyInformationGetById).mockResolvedValue({
      uid: "company-456",
      companyName: "Test Company",
      profilePhoto: "https://example.com/company.jpg",
    } as ReturnType<typeof webCompanyInformationGetById> extends Promise<infer T> ? T : never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("text message", () => {
    it("should create message with correct roomId", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: "room-123",
        }),
        expect.any(String)
      );
    });

    it("should set sender info from current user", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          senderId: "user-123",
        }),
        "user-123"
      );
    });

    it('should set type as "text"', async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "text",
        }),
        expect.any(String)
      );
    });

    it("should set timestamp to server time", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      const beforeTime = Date.now();
      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });
      const afterTime = Date.now();

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
        }),
        expect.any(String)
      );

      const callArgs = vi.mocked(messagesRepository.create).mock.calls[0][0];
      expect(callArgs.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(callArgs.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should set unread array with other party userId", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      // Since sender is candidate-123, other party is company-456
      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          unread: expect.arrayContaining(["company-456"]),
        }),
        expect.any(String)
      );
    });

    it("should update room lastMessageText", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      expect(chatRepository.update).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          lastMessage: "Hello world",
        }),
        expect.any(String)
      );
    });

    it("should update room lastMessageTime", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      expect(chatRepository.update).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          lastupdate: expect.any(Number),
        }),
        expect.any(String)
      );
    });

    it("should update room lastMessageSender", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      expect(chatRepository.update).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          lastMessageSender: "candidate",
        }),
        expect.any(String)
      );
    });

    it("should return created message with uid", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      const result = await sendMessageFirestore({
        roomId: "room-123",
        message: "Hello world",
        type: "text",
      });

      expect(result).toEqual(
        expect.objectContaining({
          messageId: "message-001",
        })
      );
    });
  });

  describe("validation", () => {
    it("should reject empty message text", async () => {
      await expect(
        sendMessageFirestore({
          roomId: "room-123",
          message: "",
          type: "text",
        })
      ).rejects.toThrow("MESSAGE_EMPTY");
    });

    it("should reject message over 5000 characters", async () => {
      const longMessage = "a".repeat(5001);

      await expect(
        sendMessageFirestore({
          roomId: "room-123",
          message: longMessage,
          type: "text",
        })
      ).rejects.toThrow("MESSAGE_TOO_LONG");
    });

    it("should throw UNAUTHORIZED when no session", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(
        sendMessageFirestore({
          roomId: "room-123",
          message: "Hello",
          type: "text",
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should throw ROOM_NOT_FOUND for invalid roomId", async () => {
      vi.mocked(chatRepository.getById).mockResolvedValue(null);

      await expect(
        sendMessageFirestore({
          roomId: "invalid-room",
          message: "Hello",
          type: "text",
        })
      ).rejects.toThrow("ROOM_NOT_FOUND");
    });

    it("should throw NOT_PARTICIPANT if user not in room", async () => {
      vi.mocked(chatRepository.getById).mockResolvedValue({
        ...mockRoom,
        candidateId: "other-candidate",
        companyId: "other-company",
      });

      await expect(
        sendMessageFirestore({
          roomId: "room-123",
          message: "Hello",
          type: "text",
        })
      ).rejects.toThrow("NOT_PARTICIPANT");
    });
  });
});
