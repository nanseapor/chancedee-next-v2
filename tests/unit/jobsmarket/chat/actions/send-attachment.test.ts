import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendAttachment } from "@/lib/database/actions/chat-messages";

// Mock dependencies
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    create: vi.fn(),
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

describe("sendAttachment", () => {
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

  describe("image upload", () => {
    it("should create message with correct roomId", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/test.jpg",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: "room-123",
        }),
        expect.any(String)
      );
    });

    it('should create message with type "image"', async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/test.jpg",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "image",
        }),
        expect.any(String)
      );
    });

    it("should set attachments to file URL", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/test.jpg",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: "https://storage.example.com/files/test.jpg",
        }),
        expect.any(String)
      );
    });

    it("should set message text to filename", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/test.jpg",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "test.jpg",
        }),
        expect.any(String)
      );
    });

    it("should set senderId from session", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/test.jpg",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          senderId: "user-123",
        }),
        "user-123"
      );
    });

    it("should update room lastMessage with image emoji", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/test.jpg",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      });

      expect(chatRepository.update).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          lastMessage: "📷 รูปภาพ",
        }),
        expect.any(String)
      );
    });
  });

  describe("file upload", () => {
    it('should create message with type "file"', async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/document.pdf",
        fileName: "document.pdf",
        fileType: "application/pdf",
        fileSize: 5000,
        type: "file",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "file",
        }),
        expect.any(String)
      );
    });

    it("should preserve original filename", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/my-document.pdf",
        fileName: "my-document.pdf",
        fileType: "application/pdf",
        fileSize: 5000,
        type: "file",
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "my-document.pdf",
        }),
        expect.any(String)
      );
    });

    it("should update room lastMessage with file emoji", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/document.pdf",
        fileName: "document.pdf",
        fileType: "application/pdf",
        fileSize: 5000,
        type: "file",
      });

      expect(chatRepository.update).toHaveBeenCalledWith(
        "room-123",
        expect.objectContaining({
          lastMessage: "📎 ไฟล์แนบ",
        }),
        expect.any(String)
      );
    });
  });

  describe("authorization", () => {
    it("should throw UNAUTHORIZED when no session", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(
        sendAttachment({
          roomId: "room-123",
          fileUrl: "https://storage.example.com/files/test.jpg",
          fileName: "test.jpg",
          fileType: "image/jpeg",
          fileSize: 1000,
          type: "image",
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should throw ROOM_NOT_FOUND for invalid roomId", async () => {
      vi.mocked(chatRepository.getById).mockResolvedValue(null);

      await expect(
        sendAttachment({
          roomId: "invalid-room",
          fileUrl: "https://storage.example.com/files/test.jpg",
          fileName: "test.jpg",
          fileType: "image/jpeg",
          fileSize: 1000,
          type: "image",
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
        sendAttachment({
          roomId: "room-123",
          fileUrl: "https://storage.example.com/files/test.jpg",
          fileName: "test.jpg",
          fileType: "image/jpeg",
          fileSize: 1000,
          type: "image",
        })
      ).rejects.toThrow("NOT_PARTICIPANT");
    });
  });

  describe("return value", () => {
    it("should return created message with messageId", async () => {
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      const result = await sendAttachment({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/files/test.jpg",
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      });

      expect(result).toEqual({ messageId: "message-001" });
    });
  });
});
