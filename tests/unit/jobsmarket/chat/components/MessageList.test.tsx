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

    expect(screen.getByTestId("empty-message-state")).toBeInTheDocument();
    expect(screen.getByText(/เริ่มต้นการสนทนา/i)).toBeInTheDocument();
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

  it("should call onLoadMore when scrolled to top", async () => {
    const onLoadMore = vi.fn();
    render(<MessageList {...defaultProps} hasMore={true} onLoadMore={onLoadMore} />);

    const container = screen.getByTestId("message-list-container");

    // Simulate scroll to top
    fireEvent.scroll(container, { target: { scrollTop: 0 } });

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalled();
    });
  });

  it("should render different bubble styles for own/other", () => {
    render(<MessageList {...defaultProps} />);

    // Own message should have specific styling
    const ownMessage = screen.getByText("Hello!").closest('[data-testid="message-bubble"]');
    expect(ownMessage).toHaveAttribute("data-is-own", "true");

    // Other's message should have different styling
    const otherMessage = screen.getByText("Hi there!").closest('[data-testid="message-bubble"]');
    expect(otherMessage).toHaveAttribute("data-is-own", "false");
  });

  it("should show loading indicator when loading more", () => {
    render(<MessageList {...defaultProps} hasMore={true} isLoading={true} />);

    expect(screen.getByTestId("load-more-spinner")).toBeInTheDocument();
  });

  it("should not call onLoadMore when hasMore is false", async () => {
    const onLoadMore = vi.fn();
    render(<MessageList {...defaultProps} hasMore={false} onLoadMore={onLoadMore} />);

    const container = screen.getByTestId("message-list-container");
    fireEvent.scroll(container, { target: { scrollTop: 0 } });

    await waitFor(() => {
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });
});
