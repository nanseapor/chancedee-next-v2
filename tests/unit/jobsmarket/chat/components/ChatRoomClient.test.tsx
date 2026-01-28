import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatRoomClient } from "@/app/jobsmarket/chat/[roomId]/_components/ChatRoomClient";

// Mock hooks
vi.mock("@/hooks/jobsmarket/chat/use-chat-messages", () => ({
  useChatMessages: vi.fn(),
}));

vi.mock("@/hooks/jobsmarket/chat/use-chat-file-upload", () => ({
  useChatFileUpload: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
  useParams: () => ({
    roomId: "room-123",
  }),
}));

import { useChatMessages } from "@/hooks/jobsmarket/chat/use-chat-messages";
import { useChatFileUpload } from "@/hooks/jobsmarket/chat/use-chat-file-upload";

describe("ChatRoomClient", () => {
  const mockMessages = [
    {
      messageId: "msg-1",
      roomId: "room-123",
      senderId: "user-123",
      message: "Hello!",
      type: "text" as const,
      timestamp: Date.now() - 1000,
      unread: [],
      name: "Me",
      avatar: "",
    },
    {
      messageId: "msg-2",
      roomId: "room-123",
      senderId: "company-456",
      message: "Hi there!",
      type: "text" as const,
      timestamp: Date.now(),
      unread: [],
      name: "Company",
      avatar: "https://example.com/avatar.jpg",
    },
  ];

  const mockRoomDetails = {
    room: {
      id: "room-123",
      candidateId: "candidate-123",
      companyId: "company-456",
    },
    otherParty: {
      id: "company-456",
      name: "บริษัท เทสต์ จำกัด",
      photo: "https://example.com/company.jpg",
      role: "company" as const,
    },
    currentUser: {
      id: "user-123",
      role: "candidate" as const,
    },
    interview: null,
    jobId: "job-789",
  };

  const defaultProps = {
    roomId: "room-123",
    initialRoomDetails: mockRoomDetails,
    initialMessages: mockMessages,
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useChatMessages).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isConnected: true,
      hasMore: false,
      error: null,
      sendMessage: vi.fn(),
      loadMore: vi.fn(),
      markAsRead: vi.fn(),
    });

    vi.mocked(useChatFileUpload).mockReturnValue({
      upload: vi.fn(),
      cancel: vi.fn(),
      reset: vi.fn(),
      isUploading: false,
      progress: 0,
      error: null,
    });
  });

  it("should render chat room header", () => {
    render(<ChatRoomClient {...defaultProps} />);

    expect(screen.getByText("บริษัท เทสต์ จำกัด")).toBeInTheDocument();
  });

  it("should render message list", () => {
    render(<ChatRoomClient {...defaultProps} />);

    expect(screen.getByText("Hello!")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("should render message input", () => {
    render(<ChatRoomClient {...defaultProps} />);

    expect(screen.getByPlaceholderText("พิมพ์ข้อความ...")).toBeInTheDocument();
  });

  it("should call sendMessage when message sent", async () => {
    const sendMessage = vi.fn();
    vi.mocked(useChatMessages).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isConnected: true,
      hasMore: false,
      error: null,
      sendMessage,
      loadMore: vi.fn(),
      markAsRead: vi.fn(),
    });

    render(<ChatRoomClient {...defaultProps} />);

    const input = screen.getByPlaceholderText("พิมพ์ข้อความ...");
    fireEvent.change(input, { target: { value: "New message" } });
    fireEvent.click(screen.getByTestId("send-button"));

    expect(sendMessage).toHaveBeenCalledWith("New message");
  });

  it("should show loading state", () => {
    vi.mocked(useChatMessages).mockReturnValue({
      messages: [],
      isLoading: true,
      isConnected: false,
      hasMore: false,
      error: null,
      sendMessage: vi.fn(),
      loadMore: vi.fn(),
      markAsRead: vi.fn(),
    });

    render(<ChatRoomClient {...defaultProps} />);

    expect(screen.getByTestId("message-list-skeleton")).toBeInTheDocument();
  });

  it("should show connection banner when disconnected", () => {
    vi.mocked(useChatMessages).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isConnected: false,
      hasMore: false,
      error: null,
      sendMessage: vi.fn(),
      loadMore: vi.fn(),
      markAsRead: vi.fn(),
    });

    render(<ChatRoomClient {...defaultProps} />);

    expect(screen.getByTestId("connection-banner")).toBeInTheDocument();
  });

  it("should show error state", () => {
    vi.mocked(useChatMessages).mockReturnValue({
      messages: [],
      isLoading: false,
      isConnected: false,
      hasMore: false,
      error: new Error("Connection failed"),
      sendMessage: vi.fn(),
      loadMore: vi.fn(),
      markAsRead: vi.fn(),
    });

    render(<ChatRoomClient {...defaultProps} />);

    // Use specific testid since both ConnectionBanner and error div show error text
    expect(screen.getByTestId("error-message")).toBeInTheDocument();
    expect(screen.getByTestId("error-message")).toHaveTextContent(/เกิดข้อผิดพลาด/i);
  });

  it("should render interview card when interview exists", () => {
    const propsWithInterview = {
      ...defaultProps,
      initialRoomDetails: {
        ...mockRoomDetails,
        interview: {
          uid: "interview-001",
          appointment: Date.now() + 86400000,
          channel: "online" as const,
          status: "pending" as const,
          isCancel: false,
          isAccepted: false,
          from: "10:00",
          to: "11:00",
          candidateName: "สมชาย ใจดี",
          companyName: "บริษัท เทสต์ จำกัด",
        },
      },
    };

    render(<ChatRoomClient {...propsWithInterview} />);

    expect(screen.getByTestId("interview-card")).toBeInTheDocument();
  });

  it("should handle file attachment", async () => {
    const upload = vi.fn();
    vi.mocked(useChatFileUpload).mockReturnValue({
      upload,
      cancel: vi.fn(),
      reset: vi.fn(),
      isUploading: false,
      progress: 0,
      error: null,
    });

    render(<ChatRoomClient {...defaultProps} />);

    const fileInput = screen.getByTestId("file-input");
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(upload).toHaveBeenCalledWith(file);
    });
  });

  it("should show upload progress", () => {
    vi.mocked(useChatFileUpload).mockReturnValue({
      upload: vi.fn(),
      cancel: vi.fn(),
      reset: vi.fn(),
      isUploading: true,
      progress: 50,
      error: null,
    });

    render(<ChatRoomClient {...defaultProps} />);

    expect(screen.getByTestId("upload-progress")).toBeInTheDocument();
  });

  it("should call markAsRead when room is visible", async () => {
    const markAsRead = vi.fn();
    vi.mocked(useChatMessages).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isConnected: true,
      hasMore: false,
      error: null,
      sendMessage: vi.fn(),
      loadMore: vi.fn(),
      markAsRead,
    });

    render(<ChatRoomClient {...defaultProps} />);

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalled();
    });
  });

  it("should load more messages when scrolled to top", async () => {
    const loadMore = vi.fn();
    vi.mocked(useChatMessages).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isConnected: true,
      hasMore: true,
      error: null,
      sendMessage: vi.fn(),
      loadMore,
      markAsRead: vi.fn(),
    });

    render(<ChatRoomClient {...defaultProps} />);

    const container = screen.getByTestId("message-list-container");
    fireEvent.scroll(container, { target: { scrollTop: 0 } });

    await waitFor(() => {
      expect(loadMore).toHaveBeenCalled();
    });
  });
});
