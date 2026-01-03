import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUploadButton } from "@/app/jobsmarket/chat/[roomId]/_components/FileUploadButton";

// Mock storage service for validation
vi.mock("@/lib/jobsmarket/services/storage-service", () => ({
  jobsmarketStorageService: {
    validateDocument: vi.fn(),
    validatePhoto: vi.fn(),
  },
}));

import { jobsmarketStorageService } from "@/lib/jobsmarket/services/storage-service";

describe("FileUploadButton", () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    disabled: false,
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
    vi.mocked(jobsmarketStorageService.validateDocument).mockReturnValue({
      isValid: true,
    });
    vi.mocked(jobsmarketStorageService.validatePhoto).mockReturnValue({
      isValid: true,
    });
  });

  it("should render attachment icon", () => {
    render(<FileUploadButton {...defaultProps} />);

    expect(screen.getByTestId("attachment-icon")).toBeInTheDocument();
  });

  it("should open file picker on click", () => {
    render(<FileUploadButton {...defaultProps} />);

    const button = screen.getByTestId("attachment-button");
    const input = screen.getByTestId("file-input");

    // Check input exists and is hidden
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveClass("hidden");

    // Click should trigger file input
    const clickSpy = vi.spyOn(input, "click");
    fireEvent.click(button);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("should accept image and document types", () => {
    render(<FileUploadButton {...defaultProps} />);

    const input = screen.getByTestId("file-input");
    const acceptAttr = input.getAttribute("accept");

    // Should accept images
    expect(acceptAttr).toContain("image/jpeg");
    expect(acceptAttr).toContain("image/png");
    expect(acceptAttr).toContain("image/gif");

    // Should accept documents
    expect(acceptAttr).toContain("application/pdf");
    expect(acceptAttr).toContain("application/msword");
  });

  it("should call onFileSelect when file chosen", async () => {
    const onFileSelect = vi.fn();
    render(<FileUploadButton {...defaultProps} onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("file-input");
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");

    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(mockFile);
    });
  });

  it("should show error for invalid file type", async () => {
    vi.mocked(jobsmarketStorageService.validateDocument).mockReturnValue({
      isValid: false,
      error: "ประเภทไฟล์ไม่รองรับ",
    });

    render(<FileUploadButton {...defaultProps} />);

    const input = screen.getByTestId("file-input");
    const mockFile = createMockFile("malware.exe", 1000, "application/x-msdownload");

    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText("ประเภทไฟล์ไม่รองรับ")).toBeInTheDocument();
    });
  });

  it("should show error for oversized file", async () => {
    vi.mocked(jobsmarketStorageService.validatePhoto).mockReturnValue({
      isValid: false,
      error: "ไฟล์มีขนาดใหญ่เกิน 10MB",
    });

    render(<FileUploadButton {...defaultProps} />);

    const input = screen.getByTestId("file-input");
    const mockFile = createMockFile("large.jpg", 11 * 1024 * 1024, "image/jpeg");

    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText("ไฟล์มีขนาดใหญ่เกิน 10MB")).toBeInTheDocument();
    });
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FileUploadButton {...defaultProps} disabled={true} />);

    const button = screen.getByTestId("attachment-button");
    expect(button).toBeDisabled();
  });

  it("should clear error after successful file selection", async () => {
    vi.mocked(jobsmarketStorageService.validatePhoto)
      .mockReturnValueOnce({ isValid: false, error: "Error" })
      .mockReturnValueOnce({ isValid: true });

    const onFileSelect = vi.fn();
    render(<FileUploadButton {...defaultProps} onFileSelect={onFileSelect} />);

    const input = screen.getByTestId("file-input");

    // First, select invalid file
    const invalidFile = createMockFile("bad.jpg", 11 * 1024 * 1024, "image/jpeg");
    fireEvent.change(input, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    // Then select valid file
    const validFile = createMockFile("good.jpg", 1000, "image/jpeg");
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.queryByText("Error")).not.toBeInTheDocument();
    });
  });

  it("should support multiple file selection when allowed", () => {
    render(<FileUploadButton {...defaultProps} multiple={true} />);

    const input = screen.getByTestId("file-input");
    expect(input).toHaveAttribute("multiple");
  });

  it("should not have multiple attribute by default", () => {
    render(<FileUploadButton {...defaultProps} />);

    const input = screen.getByTestId("file-input");
    expect(input).not.toHaveAttribute("multiple");
  });
});
