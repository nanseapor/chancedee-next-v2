/**
 * Unit Tests for ChatRoomList Component
 * Per CHAT-R01 RIS §3.2 List Layout
 *
 * RED Phase: These tests should FAIL because the component doesn't exist yet.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// This import will fail in RED phase - component doesn't exist yet
import { ChatRoomList } from "@/components/jobsmarket/chat/ChatRoomList";

// Mock the ChatRoomCard component
vi.mock("@/components/jobsmarket/chat/ChatRoomCard", () => ({
  ChatRoomCard: vi.fn(({ otherPartyName, uid, onSelect }) => (
    <div data-testid="chat-room-card" onClick={() => onSelect(uid)}>
      {otherPartyName}
    </div>
  )),
}));

// Mock the ChatEmptyState component
vi.mock("@/components/jobsmarket/chat/ChatEmptyState", () => ({
  ChatEmptyState: vi.fn(({ type }) => (
    <div data-testid="chat-empty-state" data-type={type}>
      Empty State: {type}
    </div>
  )),
}));

// Mock the Skeleton component
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: vi.fn(() => <div data-testid="skeleton" />),
}));

describe("ChatRoomList", () => {
  const mockRooms = [
    {
      uid: "room-1",
      otherPartyId: "company-1",
      otherPartyName: "บริษัท A",
      otherPartyPhoto: "https://example.com/a.jpg",
      positionContext: "Developer",
      lastMessageText: "สวัสดี",
      lastMessageTime: Date.now(),
      lastMessageSender: "hr" as const,
      unreadCount: 2,
      hasPendingAppointment: false,
    },
    {
      uid: "room-2",
      otherPartyId: "company-2",
      otherPartyName: "บริษัท B",
      otherPartyPhoto: null,
      positionContext: "Designer",
      lastMessageText: "ขอบคุณ",
      lastMessageTime: Date.now() - 1000,
      lastMessageSender: "candidate" as const,
      unreadCount: 0,
      hasPendingAppointment: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering Rooms", () => {
    it("should render list of ChatRoomCard components", () => {
      render(
        <ChatRoomList
          rooms={mockRooms}
          isLoading={false}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      const cards = screen.getAllByTestId("chat-room-card");
      expect(cards).toHaveLength(2);
    });

    it("should render rooms in correct order", () => {
      render(
        <ChatRoomList
          rooms={mockRooms}
          isLoading={false}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      const cards = screen.getAllByTestId("chat-room-card");
      expect(cards[0]).toHaveTextContent("บริษัท A");
      expect(cards[1]).toHaveTextContent("บริษัท B");
    });

    it("should pass isSelected to selected room card", async () => {
      render(
        <ChatRoomList
          rooms={mockRooms}
          isLoading={false}
          error={null}
          selectedRoomId="room-1"
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      // The ChatRoomCard mock should receive isSelected=true for room-1
      // This is verified by checking the mock call
      const { ChatRoomCard } = vi.mocked(
        await import("@/components/jobsmarket/chat/ChatRoomCard")
      );
      // Find the call that has isSelected=true and uid=room-1
      const calls = (ChatRoomCard as unknown as { mock: { calls: Array<[unknown]> } }).mock.calls;
      const room1Call = calls.find((call) => {
        const props = call[0] as { uid: string; isSelected: boolean };
        return props.uid === "room-1";
      });
      expect(room1Call).toBeDefined();
      expect((room1Call![0] as { isSelected: boolean }).isSelected).toBe(true);
    });
  });

  describe("Empty State", () => {
    it("should render empty state when no rooms", () => {
      render(
        <ChatRoomList
          rooms={[]}
          isLoading={false}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      const emptyState = screen.getByTestId("chat-empty-state");
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveAttribute("data-type", "candidate");
    });

    it("should pass correct empty type for company role", () => {
      render(
        <ChatRoomList
          rooms={[]}
          isLoading={false}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="company"
        />
      );

      const emptyState = screen.getByTestId("chat-empty-state");
      expect(emptyState).toHaveAttribute("data-type", "company");
    });
  });

  describe("Loading State", () => {
    it("should render skeleton when loading", () => {
      render(
        <ChatRoomList
          rooms={[]}
          isLoading={true}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      const skeletons = screen.getAllByTestId("skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should not render rooms when loading", () => {
      render(
        <ChatRoomList
          rooms={mockRooms}
          isLoading={true}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      expect(screen.queryByTestId("chat-room-card")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error state on error", () => {
      const mockError = new Error("Failed to load");

      render(
        <ChatRoomList
          rooms={[]}
          isLoading={false}
          error={mockError}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      expect(screen.getByTestId("chat-error-state")).toBeInTheDocument();
      expect(screen.getByText(/ไม่สามารถโหลดการสนทนา/)).toBeInTheDocument();
    });

    it("should show retry button on error", () => {
      const mockError = new Error("Failed to load");
      const onRetry = vi.fn();

      render(
        <ChatRoomList
          rooms={[]}
          isLoading={false}
          error={mockError}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          onRetry={onRetry}
          userRole="candidate"
        />
      );

      const retryButton = screen.getByRole("button", { name: /ลองใหม่/ });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe("Selection Handling", () => {
    it("should call onSelectRoom when room is clicked", () => {
      const onSelectRoom = vi.fn();

      render(
        <ChatRoomList
          rooms={mockRooms}
          isLoading={false}
          error={null}
          selectedRoomId={null}
          onSelectRoom={onSelectRoom}
          userRole="candidate"
        />
      );

      const firstCard = screen.getAllByTestId("chat-room-card")[0];
      fireEvent.click(firstCard);

      expect(onSelectRoom).toHaveBeenCalledWith("room-1");
    });
  });

  describe("Accessibility", () => {
    it("should have role=list", () => {
      render(
        <ChatRoomList
          rooms={mockRooms}
          isLoading={false}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("should announce loading state", () => {
      render(
        <ChatRoomList
          rooms={[]}
          isLoading={true}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
        />
      );

      expect(screen.getByText(/กำลังโหลด/)).toBeInTheDocument();
    });
  });

  describe("Filtered Results", () => {
    it("should render no_results empty state when search returns empty", () => {
      render(
        <ChatRoomList
          rooms={[]}
          isLoading={false}
          error={null}
          selectedRoomId={null}
          onSelectRoom={vi.fn()}
          userRole="candidate"
          searchQuery="ค้นหาที่ไม่เจอ"
          isSearchResult={true}
        />
      );

      const emptyState = screen.getByTestId("chat-empty-state");
      expect(emptyState).toHaveAttribute("data-type", "no_results");
    });
  });
});
