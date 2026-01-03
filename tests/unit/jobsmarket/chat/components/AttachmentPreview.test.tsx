import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AttachmentPreview } from "@/app/jobsmarket/chat/[roomId]/_components/AttachmentPreview";

describe("AttachmentPreview", () => {
  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const blob = new Blob(["x".repeat(size)], { type });
    return new File([blob], name, { type });
  };

  const defaultImageFile = createMockFile("photo.jpg", 50000, "image/jpeg");
  const defaultDocFile = createMockFile("document.pdf", 100000, "application/pdf");

  const defaultProps = {
    file: defaultImageFile,
    onRemove: vi.fn(),
    progress: 0,
    isUploading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render image preview for images", () => {
    render(<AttachmentPreview {...defaultProps} file={defaultImageFile} />);

    expect(screen.getByTestId("image-preview")).toBeInTheDocument();
  });

  it("should render file icon for documents", () => {
    render(<AttachmentPreview {...defaultProps} file={defaultDocFile} />);

    expect(screen.getByTestId("file-icon")).toBeInTheDocument();
  });

  it("should render filename", () => {
    render(<AttachmentPreview {...defaultProps} file={defaultDocFile} />);

    expect(screen.getByText("document.pdf")).toBeInTheDocument();
  });

  it("should render file size", () => {
    render(<AttachmentPreview {...defaultProps} file={defaultDocFile} />);

    // 100000 bytes ≈ 98 KB
    expect(screen.getByText(/98.*KB/i)).toBeInTheDocument();
  });

  it("should render remove button", () => {
    render(<AttachmentPreview {...defaultProps} />);

    expect(screen.getByTestId("remove-button")).toBeInTheDocument();
  });

  it("should call onRemove when remove clicked", () => {
    const onRemove = vi.fn();
    render(<AttachmentPreview {...defaultProps} onRemove={onRemove} />);

    fireEvent.click(screen.getByTestId("remove-button"));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("should render upload progress", () => {
    render(<AttachmentPreview {...defaultProps} isUploading={true} progress={50} />);

    const progressBar = screen.getByTestId("upload-progress");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("should show progress percentage", () => {
    render(<AttachmentPreview {...defaultProps} isUploading={true} progress={75} />);

    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("should hide remove button during upload", () => {
    render(<AttachmentPreview {...defaultProps} isUploading={true} progress={50} />);

    expect(screen.queryByTestId("remove-button")).not.toBeInTheDocument();
  });

  it("should show uploading indicator", () => {
    render(<AttachmentPreview {...defaultProps} isUploading={true} progress={30} />);

    expect(screen.getByText(/กำลังอัปโหลด/i)).toBeInTheDocument();
  });

  it("should truncate long filenames", () => {
    const longNameFile = createMockFile(
      "this-is-a-very-long-filename-that-should-be-truncated.pdf",
      1000,
      "application/pdf"
    );
    render(<AttachmentPreview {...defaultProps} file={longNameFile} />);

    const filename = screen.getByTestId("filename");
    expect(filename).toHaveClass("truncate");
  });

  it("should show correct icon for different file types", () => {
    const wordFile = createMockFile("document.docx", 1000, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    const { rerender } = render(<AttachmentPreview {...defaultProps} file={wordFile} />);
    expect(screen.getByTestId("word-icon")).toBeInTheDocument();

    const excelFile = createMockFile("spreadsheet.xlsx", 1000, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    rerender(<AttachmentPreview {...defaultProps} file={excelFile} />);
    expect(screen.getByTestId("excel-icon")).toBeInTheDocument();
  });

  it("should show file size in appropriate units", () => {
    // Small file (KB)
    const smallFile = createMockFile("small.txt", 500, "text/plain");
    const { rerender } = render(<AttachmentPreview {...defaultProps} file={smallFile} />);
    expect(screen.getByText(/500\s*B/i)).toBeInTheDocument();

    // Medium file (KB)
    const mediumFile = createMockFile("medium.pdf", 150000, "application/pdf");
    rerender(<AttachmentPreview {...defaultProps} file={mediumFile} />);
    expect(screen.getByText(/146.*KB/i)).toBeInTheDocument();

    // Large file (MB)
    const largeFile = createMockFile("large.zip", 5000000, "application/zip");
    rerender(<AttachmentPreview {...defaultProps} file={largeFile} />);
    expect(screen.getByText(/4\.8.*MB/i)).toBeInTheDocument();
  });
});
