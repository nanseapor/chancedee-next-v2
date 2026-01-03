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
    message: "",
    type: "file" as const,
    timestamp: Date.now(),
    unread: [],
    attachments: "https://example.com/document.pdf",
    fileName: "report.pdf",
    fileSize: 1024000,
    fileType: "application/pdf",
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
      const now = new Date();
      const timeString = now.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });

      render(
        <MessageBubble
          message={{ ...defaultTextMessage, timestamp: now.getTime() }}
          {...defaultProps}
        />
      );

      expect(screen.getByText(timeString)).toBeInTheDocument();
    });

    it("should apply own style for current user", () => {
      render(<MessageBubble message={defaultTextMessage} {...defaultProps} />);

      const bubble = screen.getByTestId("message-bubble");
      expect(bubble).toHaveClass("bg-primary");
      expect(bubble).toHaveAttribute("data-is-own", "true");
    });

    it("should apply other style for other party", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, senderId: "other-user" }}
          {...defaultProps}
        />
      );

      const bubble = screen.getByTestId("message-bubble");
      expect(bubble).toHaveClass("bg-gray-100");
      expect(bubble).toHaveAttribute("data-is-own", "false");
    });

    it("should render avatar for other party messages", () => {
      render(
        <MessageBubble
          message={{
            ...defaultTextMessage,
            senderId: "other-user",
            avatar: "https://example.com/avatar.jpg",
          }}
          {...defaultProps}
        />
      );

      const avatar = screen.getByRole("img", { name: /avatar/i });
      expect(avatar).toBeInTheDocument();
    });

    it("should not render avatar for own messages", () => {
      render(<MessageBubble message={defaultTextMessage} {...defaultProps} />);

      expect(screen.queryByRole("img", { name: /avatar/i })).not.toBeInTheDocument();
    });
  });

  describe("image message", () => {
    it("should render image thumbnail", () => {
      render(<MessageBubble message={defaultImageMessage} {...defaultProps} />);

      const image = screen.getByTestId("message-image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", expect.stringContaining("image.jpg"));
    });

    it("should open full image on click", () => {
      const onImageClick = vi.fn();
      render(
        <MessageBubble
          message={defaultImageMessage}
          {...defaultProps}
          onImageClick={onImageClick}
        />
      );

      fireEvent.click(screen.getByTestId("message-image"));

      expect(onImageClick).toHaveBeenCalledWith(defaultImageMessage.attachments);
    });

    it("should show loading placeholder", () => {
      render(<MessageBubble message={defaultImageMessage} {...defaultProps} />);

      // Initially shows loading placeholder
      expect(screen.getByTestId("image-loading-placeholder")).toBeInTheDocument();
    });
  });

  describe("file message", () => {
    it("should render file icon", () => {
      render(<MessageBubble message={defaultFileMessage} {...defaultProps} />);

      expect(screen.getByTestId("file-icon")).toBeInTheDocument();
    });

    it("should render filename", () => {
      render(<MessageBubble message={defaultFileMessage} {...defaultProps} />);

      expect(screen.getByText("report.pdf")).toBeInTheDocument();
    });

    it("should render file size", () => {
      render(<MessageBubble message={defaultFileMessage} {...defaultProps} />);

      // 1024000 bytes = 1 MB
      expect(screen.getByText("1 MB")).toBeInTheDocument();
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
        defaultFileMessage.fileName
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

      expect(screen.getByTestId("sending-indicator")).toBeInTheDocument();
    });

    it("should show sent indicator", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, status: "sent" }}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId("sent-indicator")).toBeInTheDocument();
    });

    it("should show failed indicator with retry", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, status: "failed" }}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId("failed-indicator")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ลองใหม่/i })).toBeInTheDocument();
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

      fireEvent.click(screen.getByRole("button", { name: /ลองใหม่/i }));

      expect(onRetry).toHaveBeenCalledWith(defaultTextMessage.messageId);
    });
  });

  describe("emoji message", () => {
    it("should render large emoji for single emoji", () => {
      render(
        <MessageBubble
          message={{ ...defaultTextMessage, type: "emoji", message: "👍" }}
          {...defaultProps}
        />
      );

      const emoji = screen.getByText("👍");
      expect(emoji).toHaveClass("text-4xl");
    });
  });

  describe("reply message", () => {
    it("should render reply context", () => {
      render(
        <MessageBubble
          message={{
            ...defaultTextMessage,
            type: "reply",
            replyToId: "msg-original",
            replyToText: "Original message",
          }}
          {...defaultProps}
        />
      );

      expect(screen.getByTestId("reply-context")).toBeInTheDocument();
      expect(screen.getByText("Original message")).toBeInTheDocument();
    });
  });
});
