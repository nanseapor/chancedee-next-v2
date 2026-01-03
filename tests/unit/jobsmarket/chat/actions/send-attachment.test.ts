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

vi.mock("@/lib/firebase/storage", () => ({
  firebaseStorageService: {
    uploadFile: vi.fn(),
    validateFile: vi.fn(),
  },
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { firebaseStorageService } from "@/lib/firebase/storage";

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

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const blob = new Blob(["x".repeat(size)], { type });
    return new File([blob], name, { type });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockSessionUser);
    vi.mocked(chatRepository.getById).mockResolvedValue(mockRoom);
    vi.mocked(firebaseStorageService.validateFile).mockReturnValue({
      isValid: true,
    });
    vi.mocked(firebaseStorageService.uploadFile).mockResolvedValue({
      downloadUrl: "https://storage.example.com/files/test.jpg",
      path: "chats/room-123/test.jpg",
      fileName: "test.jpg",
      fileSize: 1000,
      contentType: "image/jpeg",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("image upload", () => {
    it("should upload file to Firebase Storage", async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(firebaseStorageService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          path: expect.stringContaining("chats/room-123"),
        })
      );
    });

    it('should create message with type "image"', async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "image",
        }),
        expect.any(String)
      );
    });

    it("should set fileUrl to storage URL", async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: "https://storage.example.com/files/test.jpg",
        }),
        expect.any(String)
      );
    });

    it("should set fileType to MIME type", async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileType: "image/jpeg",
        }),
        expect.any(String)
      );
    });

    it("should set fileSize", async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileSize: 1000,
        }),
        expect.any(String)
      );
    });

    it("should generate thumbnail for images", async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          thumbnailUrl: expect.any(String),
        }),
        expect.any(String)
      );
    });
  });

  describe("file upload", () => {
    it('should create message with type "file"', async () => {
      const mockFile = createMockFile("document.pdf", 5000, "application/pdf");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");
      vi.mocked(firebaseStorageService.uploadFile).mockResolvedValue({
        downloadUrl: "https://storage.example.com/files/document.pdf",
        path: "chats/room-123/document.pdf",
        fileName: "document.pdf",
        fileSize: 5000,
        contentType: "application/pdf",
      });

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "file",
        }),
        expect.any(String)
      );
    });

    it("should preserve original filename", async () => {
      const mockFile = createMockFile(
        "my-document.pdf",
        5000,
        "application/pdf"
      );
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: "my-document.pdf",
        }),
        expect.any(String)
      );
    });

    it("should set fileUrl to storage URL", async () => {
      const mockFile = createMockFile("document.pdf", 5000, "application/pdf");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");
      vi.mocked(firebaseStorageService.uploadFile).mockResolvedValue({
        downloadUrl: "https://storage.example.com/files/document.pdf",
        path: "chats/room-123/document.pdf",
        fileName: "document.pdf",
        fileSize: 5000,
        contentType: "application/pdf",
      });

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
      });

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: "https://storage.example.com/files/document.pdf",
        }),
        expect.any(String)
      );
    });
  });

  describe("validation", () => {
    it("should reject files over 10MB", async () => {
      const largeFile = createMockFile(
        "large.jpg",
        11 * 1024 * 1024,
        "image/jpeg"
      );
      vi.mocked(firebaseStorageService.validateFile).mockReturnValue({
        isValid: false,
        error: "FILE_TOO_LARGE",
      });

      await expect(
        sendAttachment({
          roomId: "room-123",
          file: largeFile,
        })
      ).rejects.toThrow("FILE_TOO_LARGE");
    });

    it("should reject disallowed file types", async () => {
      const executableFile = createMockFile(
        "malware.exe",
        1000,
        "application/x-msdownload"
      );
      vi.mocked(firebaseStorageService.validateFile).mockReturnValue({
        isValid: false,
        error: "INVALID_FILE_TYPE",
      });

      await expect(
        sendAttachment({
          roomId: "room-123",
          file: executableFile,
        })
      ).rejects.toThrow("INVALID_FILE_TYPE");
    });

    it("should throw UNAUTHORIZED when no session", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");

      await expect(
        sendAttachment({
          roomId: "room-123",
          file: mockFile,
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });
  });

  describe("progress", () => {
    it("should report upload progress", async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      const onProgress = vi.fn();
      vi.mocked(messagesRepository.create).mockResolvedValue("message-001");

      await sendAttachment({
        roomId: "room-123",
        file: mockFile,
        onProgress,
      });

      expect(firebaseStorageService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          onProgress: expect.any(Function),
        })
      );
    });

    it("should handle upload cancellation", async () => {
      const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
      const abortController = new AbortController();
      vi.mocked(firebaseStorageService.uploadFile).mockRejectedValue(
        new Error("UPLOAD_CANCELLED")
      );

      await expect(
        sendAttachment({
          roomId: "room-123",
          file: mockFile,
          signal: abortController.signal,
        })
      ).rejects.toThrow("UPLOAD_CANCELLED");
    });
  });
});
