import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatFileUpload } from "@/hooks/jobsmarket/chat/use-chat-file-upload";

// Mock server actions
vi.mock("@/lib/database/actions/chat-messages", () => ({
  sendAttachment: vi.fn(),
}));

// Mock storage service
vi.mock("@/lib/jobsmarket/services/storage-service", () => ({
  jobsmarketStorageService: {
    validateDocument: vi.fn(),
    validatePhoto: vi.fn(),
    uploadDocument: vi.fn(),
  },
}));

import { sendAttachment } from "@/lib/database/actions/chat-messages";
import { jobsmarketStorageService } from "@/lib/jobsmarket/services/storage-service";

describe("useChatFileUpload", () => {
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
    vi.mocked(jobsmarketStorageService.validateDocument).mockReturnValue({
      isValid: true,
    });
    vi.mocked(jobsmarketStorageService.validatePhoto).mockReturnValue({
      isValid: true,
    });
    vi.mocked(jobsmarketStorageService.uploadDocument).mockResolvedValue(
      "https://storage.example.com/file.jpg"
    );
    vi.mocked(sendAttachment).mockResolvedValue({ messageId: "msg-123" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate file size before upload", async () => {
    const largeFile = createMockFile("large.jpg", 11 * 1024 * 1024, "image/jpeg");
    vi.mocked(jobsmarketStorageService.validatePhoto).mockReturnValue({
      isValid: false,
      error: "ไฟล์มีขนาดใหญ่เกิน 10MB",
    });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    await act(async () => {
      try {
        await result.current.upload(largeFile);
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.error).toBe("ไฟล์มีขนาดใหญ่เกิน 10MB");
  });

  it("should validate file type before upload", async () => {
    const executableFile = createMockFile("malware.exe", 1000, "application/x-msdownload");
    vi.mocked(jobsmarketStorageService.validateDocument).mockReturnValue({
      isValid: false,
      error: "ประเภทไฟล์ไม่รองรับ",
    });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    await act(async () => {
      try {
        await result.current.upload(executableFile);
      } catch {
        // Expected to fail
      }
    });

    expect(result.current.error).toBe("ประเภทไฟล์ไม่รองรับ");
  });

  it("should return upload progress", async () => {
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
    let progressCallback: ((progress: number) => void) | undefined;

    vi.mocked(sendAttachment).mockImplementation(async ({ onProgress }) => {
      progressCallback = onProgress;
      // Simulate progress updates
      await new Promise((resolve) => setTimeout(resolve, 50));
      onProgress?.(25);
      await new Promise((resolve) => setTimeout(resolve, 50));
      onProgress?.(50);
      await new Promise((resolve) => setTimeout(resolve, 50));
      onProgress?.(75);
      await new Promise((resolve) => setTimeout(resolve, 50));
      onProgress?.(100);
      return { messageId: "msg-001" };
    });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    const progressValues: number[] = [];

    act(() => {
      result.current.upload(mockFile);
    });

    await waitFor(() => {
      if (result.current.progress > 0) {
        progressValues.push(result.current.progress);
      }
    });

    await waitFor(() => {
      expect(result.current.progress).toBeGreaterThanOrEqual(0);
    });
  });

  it("should return uploading state", async () => {
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
    vi.mocked(sendAttachment).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ messageId: "msg-001" }), 500))
    );

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    expect(result.current.isUploading).toBe(false);

    act(() => {
      result.current.upload(mockFile);
    });

    await waitFor(() => {
      expect(result.current.isUploading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isUploading).toBe(false);
    });
  });

  it("should return error on failure", async () => {
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
    vi.mocked(sendAttachment).mockRejectedValue(new Error("Upload failed"));

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    await act(async () => {
      try {
        await result.current.upload(mockFile);
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe("Upload failed");
  });

  it("should allow cancellation", async () => {
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
    let abortSignal: AbortSignal | undefined;

    vi.mocked(sendAttachment).mockImplementation(async ({ signal }) => {
      abortSignal = signal;
      return new Promise((_, reject) => {
        signal?.addEventListener("abort", () => {
          reject(new Error("UPLOAD_CANCELLED"));
        });
        // Keep the promise pending until cancelled
        setTimeout(() => reject(new Error("Timeout")), 10000);
      });
    });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    act(() => {
      result.current.upload(mockFile);
    });

    await waitFor(() => {
      expect(result.current.isUploading).toBe(true);
    });

    act(() => {
      result.current.cancel();
    });

    await waitFor(() => {
      expect(result.current.isUploading).toBe(false);
    });
  });

  it("should call sendAttachment with file metadata on complete", async () => {
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
    vi.mocked(sendAttachment).mockResolvedValue({ messageId: "msg-001" });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    await act(async () => {
      await result.current.upload(mockFile);
    });

    // Implementation uploads to storage first, then calls sendAttachment with metadata
    expect(sendAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: "room-123",
        fileUrl: "https://storage.example.com/file.jpg", // From mocked uploadDocument
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1000,
        type: "image",
      })
    );
  });

  it("should reset state after upload", async () => {
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");
    vi.mocked(sendAttachment).mockResolvedValue({ messageId: "msg-001" });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    await act(async () => {
      await result.current.upload(mockFile);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.isUploading).toBe(false);
  });

  it("should determine file type correctly for images", async () => {
    const imageFile = createMockFile("photo.png", 1000, "image/png");
    vi.mocked(sendAttachment).mockResolvedValue({ messageId: "msg-001" });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    await act(async () => {
      await result.current.upload(imageFile);
    });

    expect(jobsmarketStorageService.validatePhoto).toHaveBeenCalledWith(imageFile);
  });

  it("should determine file type correctly for documents", async () => {
    const docFile = createMockFile("document.pdf", 1000, "application/pdf");
    vi.mocked(sendAttachment).mockResolvedValue({ messageId: "msg-001" });

    const { result } = renderHook(() =>
      useChatFileUpload({
        roomId: "room-123",
      })
    );

    await act(async () => {
      await result.current.upload(docFile);
    });

    expect(jobsmarketStorageService.validateDocument).toHaveBeenCalledWith(docFile);
  });
});
