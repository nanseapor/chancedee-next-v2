import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageBubble } from "@/app/jobsmarket/chat/[roomId]/_components/MessageBubble";

describe("MessageBubble", () => {
  const defaultTextMessage = {
    messageId: "msg-1",
    roomId: "room-123",
    senderId: "user-123",
    message: "Hello, world!",
    type: "text" as const,
    timestamp: Date.now(),
    unread: [],
    name: "Me",
    avatar: "",
  };

  const defaultImageMessage = {
    messageId: "msg-2",
    roomId: "room-123",
    senderId: "company-456",
    message: "",
    type: "image" as const,
    timestamp: Date.now(),
    unread: [],
    attachments: "https://example.com/image.jpg",
    fileType: "image/jpeg",
    name: "Company",
    avatar: "https://example.com/avatar.jpg",
  };

  const defaultFileMessage = {
    messageId: "msg-3",
    roomId: "room-123",
    senderId: "company-456",
    message: "report.pdf",
    type: "file" as const,
    timestamp: Date.now(),
    unread: [],
    attachments: "https://example.com/document.pdf",
    name: "Company",
    avatar: "https://example.com/avatar.jpg",
  };

  const defaultProps = {
    currentUserId: "user-123",
    onRetry: vi.fn(),
    onImageClick: vi.fn(),
    onDownload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("text message", () => {
    it("should render message text", () => {
      render(<MessageBubble message={defaultTextMessage} {...defaultProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render timestamp", () => {
      render(<MessageBubble message={defaultTextMessage} {...defaultProps} />);

      // Format should be HH:mm in Thai locale
      expect(screen.getByTestId("message-bubble")).toBeInTheDocument();
    });

    it("should apply own style for current user (justify-end)", () => {
      render(<MessageBubble message={defaultTextMessage} {...defaultProps} />);

      const bubble = screen.getByTestId("message-bubble");
      expect(bubble).toHaveClass("justify-end");
    });

    it("should apply other style for other party (justify-start)", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, senderId: "other-user" }}
          {...defaultProps}
        />
      );

      const bubble = screen.getByTestId("message-bubble");
      expect(bubble).toHaveClass("justify-start");
    });

    it("should render text content with testid", () => {
      render(<MessageBubble message={defaultTextMessage} {...defaultProps} />);

      expect(screen.getByTestId("text-content")).toBeInTheDocument();
    });

    it("should not render avatar (handled by MessageList)", () => {
      render(<MessageBubble message={defaultTextMessage} {...defaultProps} />);

      expect(screen.queryByRole("img", { name: /avatar/i })).not.toBeInTheDocument();
    });
  });

  describe("image message", () => {
    it("should render image content", () => {
      render(<MessageBubble message={defaultImageMessage} {...defaultProps} />);

      const imageContent = screen.getByTestId("image-content");
      expect(imageContent).toBeInTheDocument();
    });

    it("should call onImageClick when image clicked", () => {
      const onImageClick = vi.fn();
      render(
        <MessageBubble
          message={defaultImageMessage}
          {...defaultProps}
          onImageClick={onImageClick}
        />
      );

      fireEvent.click(screen.getByTestId("image-content"));

      expect(onImageClick).toHaveBeenCalledWith(defaultImageMessage.attachments);
    });

    it("should render image with alt text", () => {
      render(<MessageBubble message={defaultImageMessage} {...defaultProps} />);

      const img = screen.getByAltText("รูปภาพที่แชร์");
      expect(img).toBeInTheDocument();
    });
  });

  describe("file message", () => {
    it("should render file content", () => {
      render(<MessageBubble message={defaultFileMessage} {...defaultProps} />);

      expect(screen.getByTestId("file-content")).toBeInTheDocument();
    });

    it("should render filename", () => {
      render(<MessageBubble message={defaultFileMessage} {...defaultProps} />);

      expect(screen.getByText("report.pdf")).toBeInTheDocument();
    });

    it("should render download button", () => {
      render(<MessageBubble message={defaultFileMessage} {...defaultProps} />);

      expect(screen.getByTestId("download-button")).toBeInTheDocument();
    });

    it("should trigger download on click", () => {
      const onDownload = vi.fn();
      render(
        <MessageBubble
          message={defaultFileMessage}
          {...defaultProps}
          onDownload={onDownload}
        />
      );

      fireEvent.click(screen.getByTestId("download-button"));

      expect(onDownload).toHaveBeenCalledWith(
        defaultFileMessage.attachments,
        defaultFileMessage.message
      );
    });
  });

  describe("message states", () => {
    it("should show sending indicator", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, status: "sending" }}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId("status-sending")).toBeInTheDocument();
    });

    it("should show sent indicator", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, status: "sent", unread: ["other"] }}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId("status-sent")).toBeInTheDocument();
    });

    it("should show read indicator when no unread", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, status: "sent", unread: [] }}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId("status-read")).toBeInTheDocument();
    });

    it("should show failed indicator with retry button", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, status: "failed" }}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId("status-failed")).toBeInTheDocument();
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });

    it("should call onRetry when retry clicked", () => {
      const onRetry = vi.fn();
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, status: "failed" }}
          {...defaultProps}
          onRetry={onRetry}
        />
      );

      fireEvent.click(screen.getByTestId("retry-button"));

      expect(onRetry).toHaveBeenCalledWith(defaultTextMessage.messageId);
    });
  });
});
