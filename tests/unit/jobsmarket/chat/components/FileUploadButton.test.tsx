import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUploadButton } from "@/app/jobsmarket/chat/[roomId]/_components/FileUploadButton";

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
  });

  it("should render file upload button", () => {
    render(<FileUploadButton {...defaultProps} />);

    expect(screen.getByTestId("file-upload-button")).toBeInTheDocument();
  });

  it("should render hidden image input", () => {
    render(<FileUploadButton {...defaultProps} />);

    const imageInput = screen.getByTestId("image-input");
    expect(imageInput).toHaveClass("hidden");
    expect(imageInput).toHaveAttribute("type", "file");
  });

  it("should render hidden document input", () => {
    render(<FileUploadButton {...defaultProps} />);

    const documentInput = screen.getByTestId("document-input");
    expect(documentInput).toHaveClass("hidden");
    expect(documentInput).toHaveAttribute("type", "file");
  });

  it("should accept image types in image input", () => {
    render(<FileUploadButton {...defaultProps} />);

    const imageInput = screen.getByTestId("image-input");
    const acceptAttr = imageInput.getAttribute("accept");

    expect(acceptAttr).toContain("image/jpeg");
    expect(acceptAttr).toContain("image/png");
    expect(acceptAttr).toContain("image/gif");
  });

  it("should accept document types in document input", () => {
    render(<FileUploadButton {...defaultProps} />);

    const documentInput = screen.getByTestId("document-input");
    const acceptAttr = documentInput.getAttribute("accept");

    expect(acceptAttr).toContain("application/pdf");
    expect(acceptAttr).toContain("application/msword");
  });

  it("should call onFileSelect when image file chosen", async () => {
    const onFileSelect = vi.fn();
    render(<FileUploadButton {...defaultProps} onFileSelect={onFileSelect} />);

    const imageInput = screen.getByTestId("image-input");
    const mockFile = createMockFile("test.jpg", 1000, "image/jpeg");

    fireEvent.change(imageInput, { target: { files: [mockFile] } });

    expect(onFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it("should call onFileSelect when document file chosen", async () => {
    const onFileSelect = vi.fn();
    render(<FileUploadButton {...defaultProps} onFileSelect={onFileSelect} />);

    const documentInput = screen.getByTestId("document-input");
    const mockFile = createMockFile("test.pdf", 1000, "application/pdf");

    fireEvent.change(documentInput, { target: { files: [mockFile] } });

    expect(onFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FileUploadButton {...defaultProps} disabled={true} />);

    const button = screen.getByTestId("file-upload-button");
    expect(button).toBeDisabled();
  });

  it("should support multiple file selection when allowed", () => {
    render(<FileUploadButton {...defaultProps} multiple={true} />);

    const imageInput = screen.getByTestId("image-input");
    const documentInput = screen.getByTestId("document-input");

    expect(imageInput).toHaveAttribute("multiple");
    expect(documentInput).toHaveAttribute("multiple");
  });

  it("should not have multiple attribute by default", () => {
    render(<FileUploadButton {...defaultProps} />);

    const imageInput = screen.getByTestId("image-input");
    const documentInput = screen.getByTestId("document-input");

    expect(imageInput).not.toHaveAttribute("multiple");
    expect(documentInput).not.toHaveAttribute("multiple");
  });

  it("should not call onFileSelect when no files provided", () => {
    const onFileSelect = vi.fn();
    render(<FileUploadButton {...defaultProps} onFileSelect={onFileSelect} />);

    const imageInput = screen.getByTestId("image-input");

    fireEvent.change(imageInput, { target: { files: [] } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("should not call onFileSelect when files is null", () => {
    const onFileSelect = vi.fn();
    render(<FileUploadButton {...defaultProps} onFileSelect={onFileSelect} />);

    const imageInput = screen.getByTestId("image-input");

    fireEvent.change(imageInput, { target: { files: null } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });
});
