/**
 * @fileoverview Unit tests for GroupedRoomCard component
 * @specification NOTIF-R01 §4.3, BLS-11-08
 *
 * TDD RED Phase: These tests should FAIL because the component doesn't exist yet.
 *
 * Requirements tested:
 * - NOTIF-R01.ui.groupedRoom: Grouped chat room card rendering
 * - BLS-11-08: groupMessagesByRoom functionality display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
// This import will fail - component doesn't exist yet (TDD RED phase)
import { GroupedRoomCard } from "@/components/jobsmarket/notifications/GroupedRoomCard";
import type { GroupedRoomItem } from "@/types/notification.types";

// Mock Date.now for consistent time formatting tests
const MOCK_NOW = 1736294400000; // 2026-01-08 00:00:00 UTC

describe("GroupedRoomCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const roomWithUnread: GroupedRoomItem = {
    roomId: "room-123",
    otherPartyName: "HR Manager - บริษัท เทสต์ จำกัด",
    otherPartyPhoto: "https://example.com/hr.jpg",
    positionContext: "Frontend Developer",
    unreadCount: 5,
    lastMessagePreview: "Please confirm your availability for the interview",
    lastMessageTime: MOCK_NOW - 10 * 60 * 1000, // 10 minutes ago
    lastMessageSender: "other",
  };

  const roomWithoutUnread: GroupedRoomItem = {
    roomId: "room-456",
    otherPartyName: "Recruiter Team",
    otherPartyPhoto: null,
    positionContext: "Backend Developer",
    unreadCount: 0,
    lastMessagePreview: "Thank you for your time",
    lastMessageTime: MOCK_NOW - 2 * 60 * 60 * 1000, // 2 hours ago
    lastMessageSender: "me",
  };

  const roomWithLongMessage: GroupedRoomItem = {
    roomId: "room-789",
    otherPartyName: "Senior HR",
    otherPartyPhoto: "https://example.com/senior.jpg",
    positionContext: null,
    unreadCount: 1,
    lastMessagePreview:
      "Hello! We would like to inform you that after careful consideration of all candidates, we have decided to move forward with your application to the next stage of our interview process. Please prepare for a technical assessment.",
    lastMessageTime: MOCK_NOW - 24 * 60 * 60 * 1000, // 1 day ago
    lastMessageSender: "other",
  };

  const defaultProps = {
    room: roomWithUnread,
    onClick: vi.fn(),
  };

  describe("Rendering", () => {
    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should render other party avatar"
     */
    it("should render other party avatar", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      // Avatar has aria-label on the wrapper, shows fallback in test environment
      const avatar = screen.getByLabelText("HR Manager - บริษัท เทสต์ จำกัด");
      expect(avatar).toBeInTheDocument();
      // Fallback letter should be visible (first char of name)
      expect(screen.getByText("H")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should render fallback avatar when no photo"
     */
    it("should render fallback avatar when no photo", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithoutUnread} />);

      // Should show first letter as fallback
      expect(screen.getByText("R")).toBeInTheDocument(); // "Recruiter Team"
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should render other party name"
     */
    it("should render other party name", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      expect(screen.getByText("HR Manager - บริษัท เทสต์ จำกัด")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should render position context when available"
     */
    it("should render position context when available", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should not render position context when null"
     */
    it("should not render position context when null", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithLongMessage} />);

      expect(screen.queryByTestId("position-context")).not.toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should render last message preview"
     */
    it("should render last message preview", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      expect(
        screen.getByText("Please confirm your availability for the interview")
      ).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should truncate long messages"
     */
    it("should truncate long message preview", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithLongMessage} />);

      const messagePreview = screen.getByTestId("last-message-preview");
      expect(messagePreview).toHaveClass("truncate");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should show 'คุณ:' prefix when last message is from me"
     */
    it("should show 'คุณ:' prefix when last message is from me", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithoutUnread} />);

      expect(screen.getByText(/คุณ:/)).toBeInTheDocument();
      expect(screen.getByText(/Thank you for your time/)).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom
     * "Should not show prefix when last message is from other"
     */
    it("should not show 'คุณ:' prefix when last message is from other", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      expect(screen.queryByText(/คุณ:/)).not.toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.time
     * "Should render relative time in Thai"
     */
    it("should render relative time in Thai", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      expect(screen.getByText("10 นาทีที่แล้ว")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.time
     * "Should render hours correctly"
     */
    it("should render hours ago correctly", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithoutUnread} />);

      expect(screen.getByText("2 ชั่วโมงที่แล้ว")).toBeInTheDocument();
    });
  });

  describe("Unread Badge", () => {
    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.badge
     * "Should render unread badge when unreadCount > 0"
     */
    it("should render unread badge when unreadCount > 0", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const badge = screen.getByTestId("unread-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("5");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.badge
     * "Should not render badge when unreadCount is 0"
     */
    it("should not render badge when unreadCount is 0", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithoutUnread} />);

      expect(screen.queryByTestId("unread-badge")).not.toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.badge
     * "Should show 99+ for counts over 99"
     */
    it("should show 99+ for counts over 99", () => {
      render(
        <GroupedRoomCard
          {...defaultProps}
          room={{
            ...roomWithUnread,
            unreadCount: 150,
          }}
        />
      );

      const badge = screen.getByTestId("unread-badge");
      expect(badge).toHaveTextContent("99+");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.badge
     * "Badge should have proper styling"
     */
    it("should have proper badge styling", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const badge = screen.getByTestId("unread-badge");
      expect(badge).toHaveClass("bg-secondary-500");
      expect(badge).toHaveClass("text-white");
    });
  });

  describe("Visual State", () => {
    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.unread
     * "Should have highlighted background when has unread"
     */
    it("should have highlighted background when has unread", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      expect(card).toHaveClass("bg-secondary-50");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.read
     * "Should have normal background when no unread"
     */
    it("should have normal background when no unread", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithoutUnread} />);

      const card = screen.getByTestId(`grouped-room-${roomWithoutUnread.roomId}`);
      expect(card).not.toHaveClass("bg-secondary-50");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.unread
     * "Name should be bold when has unread"
     */
    it("should have bold name when has unread", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const name = screen.getByText("HR Manager - บริษัท เทสต์ จำกัด");
      expect(name).toHaveClass("font-semibold");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.read
     * "Name should be normal weight when no unread"
     */
    it("should have normal weight name when no unread", () => {
      render(<GroupedRoomCard {...defaultProps} room={roomWithoutUnread} />);

      const name = screen.getByText("Recruiter Team");
      expect(name).not.toHaveClass("font-semibold");
    });
  });

  describe("Interaction", () => {
    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.click
     * "Should call onClick when card clicked"
     */
    it("should call onClick with roomId when card clicked", () => {
      const onClick = vi.fn();
      render(<GroupedRoomCard {...defaultProps} onClick={onClick} />);

      fireEvent.click(screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`));

      expect(onClick).toHaveBeenCalledWith("room-123");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.click
     * "Should be keyboard accessible"
     */
    it("should support keyboard activation", () => {
      const onClick = vi.fn();
      render(<GroupedRoomCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      fireEvent.keyDown(card, { key: "Enter" });

      expect(onClick).toHaveBeenCalledWith("room-123");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.click
     * "Should support space key activation"
     */
    it("should support space key activation", () => {
      const onClick = vi.fn();
      render(<GroupedRoomCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      fireEvent.keyDown(card, { key: " " });

      expect(onClick).toHaveBeenCalledWith("room-123");
    });

    /**
     * Requirement: NOTIF-R01.ui.groupedRoom.hover
     * "Should have hover state"
     */
    it("should have hover styling class", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      expect(card).toHaveClass("hover:bg-gray-50");
    });
  });

  describe("Accessibility", () => {
    /**
     * Requirement: NOTIF-R01.a11y
     * "Should have appropriate aria-label"
     */
    it("should have appropriate aria-label", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("HR Manager")
      );
    });

    /**
     * Requirement: NOTIF-R01.a11y
     * "Should indicate unread count in aria-label"
     */
    it("should indicate unread count in aria-label", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("5 ข้อความที่ยังไม่ได้อ่าน")
      );
    });

    /**
     * Requirement: NOTIF-R01.a11y
     * "Should have role button or link"
     */
    it("should be interactive element", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      expect(card.getAttribute("role")).toMatch(/button|link/);
    });

    /**
     * Requirement: NOTIF-R01.a11y
     * "Should be focusable"
     */
    it("should be focusable", () => {
      render(<GroupedRoomCard {...defaultProps} />);

      const card = screen.getByTestId(`grouped-room-${roomWithUnread.roomId}`);
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });
});
