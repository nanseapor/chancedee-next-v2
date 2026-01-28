import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MessageList } from "@/app/jobsmarket/chat/[roomId]/_components/MessageList";

describe("MessageList", () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const mockMessages = [
    {
      messageId: "msg-1",
      roomId: "room-123",
      senderId: "user-123",
      message: "Hello!",
      type: "text" as const,
      timestamp: today.getTime(),
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
      timestamp: today.getTime() - 1000,
      unread: [],
      name: "Company",
      avatar: "https://example.com/avatar.jpg",
    },
    {
      messageId: "msg-3",
      roomId: "room-123",
      senderId: "user-123",
      message: "Yesterday message",
      type: "text" as const,
      timestamp: yesterday.getTime(),
      unread: [],
      name: "Me",
      avatar: "",
    },
  ];

  const defaultProps = {
    messages: mockMessages,
    currentUserId: "user-123",
    isLoading: false,
    hasMore: false,
    onLoadMore: vi.fn(),
    onRetry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render list of messages", () => {
    render(<MessageList {...defaultProps} />);

    expect(screen.getByText("Hello!")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    expect(screen.getByText("Yesterday message")).toBeInTheDocument();
  });

  it("should group messages by date", () => {
    render(<MessageList {...defaultProps} />);

    // Should show date dividers for today and yesterday
    const dividers = screen.getAllByTestId("date-divider");
    expect(dividers.length).toBeGreaterThanOrEqual(2);
  });

  it("should render DateDivider between days", () => {
    render(<MessageList {...defaultProps} />);

    expect(screen.getByText("วันนี้")).toBeInTheDocument();
    expect(screen.getByText("เมื่อวาน")).toBeInTheDocument();
  });

  it("should render loading skeleton when loading", () => {
    render(<MessageList {...defaultProps} isLoading={true} messages={[]} />);

    expect(screen.getByTestId("message-list-skeleton")).toBeInTheDocument();
  });

  it("should render empty state when no messages", () => {
    render(<MessageList {...defaultProps} isLoading={false} messages={[]} />);

    expect(screen.getByTestId("message-list-empty")).toBeInTheDocument();
    expect(screen.getByText(/เริ่มการสนทนา/i)).toBeInTheDocument();
  });

  it("should scroll to bottom on new message", async () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(<MessageList {...defaultProps} />);

    const newMessages = [
      ...mockMessages,
      {
        messageId: "msg-new",
        roomId: "room-123",
        senderId: "company-456",
        message: "New message!",
        type: "text" as const,
        timestamp: Date.now(),
        unread: [],
        name: "Company",
        avatar: "",
      },
    ];

    rerender(<MessageList {...defaultProps} messages={newMessages} />);

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });

  it("should render message-list-container", () => {
    render(<MessageList {...defaultProps} />);

    expect(screen.getByTestId("message-list-container")).toBeInTheDocument();
  });

  it("should render load more button when hasMore is true", () => {
    render(<MessageList {...defaultProps} hasMore={true} />);

    expect(screen.getByTestId("load-more-button")).toBeInTheDocument();
  });

  it("should call onLoadMore when load more clicked", async () => {
    const onLoadMore = vi.fn();
    render(<MessageList {...defaultProps} hasMore={true} onLoadMore={onLoadMore} />);

    const loadMoreButton = screen.getByTestId("load-more-button");
    fireEvent.click(loadMoreButton);

    expect(onLoadMore).toHaveBeenCalled();
  });

  it("should render MessageBubble for each message", () => {
    render(<MessageList {...defaultProps} />);

    const bubbles = screen.getAllByTestId("message-bubble");
    expect(bubbles.length).toBe(3);
  });

  it("should not show load more when hasMore is false", () => {
    render(<MessageList {...defaultProps} hasMore={false} />);

    expect(screen.queryByTestId("load-more-button")).not.toBeInTheDocument();
  });
});
