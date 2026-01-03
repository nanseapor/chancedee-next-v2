/**
 * Unit Tests for ChatRoomCard Component
 * Per CHAT-R01 RIS §3.1 RoomCard Layout
 *
 * RED Phase: These tests should FAIL because the component doesn't exist yet.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// This import will fail in RED phase - component doesn't exist yet
import { ChatRoomCard } from "@/components/jobsmarket/chat/ChatRoomCard";

// Mock Date.now for consistent time formatting tests
const MOCK_NOW = 1700000000000; // Fixed timestamp for testing

describe("ChatRoomCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    uid: "room-123",
    otherPartyId: "company-456",
    otherPartyName: "บริษัท ทดสอบ จำกัด",
    otherPartyPhoto: "https://example.com/avatar.jpg",
    positionContext: "Frontend Developer",
    lastMessageText: "สวัสดีครับ ขอบคุณที่สนใจสมัครงาน",
    lastMessageTime: MOCK_NOW - 5 * 60 * 1000, // 5 minutes ago
    lastMessageSender: "hr" as const,
    unreadCount: 0,
    hasPendingAppointment: false,
    isSelected: false,
    onSelect: vi.fn(),
  };

  describe("Rendering", () => {
    it("should render other party name", () => {
      render(<ChatRoomCard {...defaultProps} />);

      expect(screen.getByText("บริษัท ทดสอบ จำกัด")).toBeInTheDocument();
    });

    it("should render other party avatar", () => {
      render(<ChatRoomCard {...defaultProps} />);

      // Avatar uses AvatarImage which creates an img tag
      // When image loads, it shows the image; when not loaded, shows fallback
      // We check for the avatar container with the name
      const avatar = screen.getByLabelText(/บริษัท ทดสอบ จำกัด/i);
      expect(avatar).toBeInTheDocument();
    });

    it("should render fallback avatar when photo is null", () => {
      render(<ChatRoomCard {...defaultProps} otherPartyPhoto={null} />);

      // Should show first character of name as fallback
      expect(screen.getByText("บ")).toBeInTheDocument();
    });

    it("should render last message preview with truncate class", () => {
      const longMessage =
        "นี่คือข้อความยาวมากที่ต้องถูกตัดให้สั้นลงเพื่อแสดงในการ์ดข้อความ ข้อความนี้ยาวเกิน 50 ตัวอักษรแน่นอน";

      render(<ChatRoomCard {...defaultProps} lastMessageText={longMessage} />);

      // Message should have truncate class for CSS-based truncation
      const messageElement = screen.getByTestId("last-message");
      expect(messageElement).toHaveClass("truncate");
      expect(messageElement.textContent).toBe(longMessage);
    });

    it("should render relative time in Thai", () => {
      render(<ChatRoomCard {...defaultProps} />);

      expect(screen.getByText("5 นาทีที่แล้ว")).toBeInTheDocument();
    });
  });

  describe("Unread Badge", () => {
    it("should render unread badge when unreadCount > 0", () => {
      render(<ChatRoomCard {...defaultProps} unreadCount={5} />);

      const badge = screen.getByTestId("unread-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("5");
    });

    it("should hide unread badge when unreadCount === 0", () => {
      render(<ChatRoomCard {...defaultProps} unreadCount={0} />);

      expect(screen.queryByTestId("unread-badge")).not.toBeInTheDocument();
    });

    it("should show 99+ when unreadCount > 99", () => {
      render(<ChatRoomCard {...defaultProps} unreadCount={150} />);

      const badge = screen.getByTestId("unread-badge");
      expect(badge).toHaveTextContent("99+");
    });
  });

  describe("Appointment Indicator", () => {
    it("should render appointment icon when hasPendingAppointment is true", () => {
      render(<ChatRoomCard {...defaultProps} hasPendingAppointment={true} />);

      // Should show calendar emoji or icon
      expect(screen.getByText("📅")).toBeInTheDocument();
    });

    it("should not render appointment icon when hasPendingAppointment is false", () => {
      render(<ChatRoomCard {...defaultProps} hasPendingAppointment={false} />);

      expect(screen.queryByText("📅")).not.toBeInTheDocument();
    });
  });

  describe("Selection State", () => {
    it("should highlight when isSelected is true", () => {
      render(<ChatRoomCard {...defaultProps} isSelected={true} />);

      const card = screen.getByTestId("chat-room-card");
      expect(card).toHaveClass("bg-secondary-50");
    });

    it("should not highlight when isSelected is false", () => {
      render(<ChatRoomCard {...defaultProps} isSelected={false} />);

      const card = screen.getByTestId("chat-room-card");
      expect(card).not.toHaveClass("bg-secondary-50");
    });
  });

  describe("Interaction", () => {
    it("should call onSelect when clicked", () => {
      const onSelect = vi.fn();
      render(<ChatRoomCard {...defaultProps} onSelect={onSelect} />);

      const card = screen.getByTestId("chat-room-card");
      fireEvent.click(card);

      expect(onSelect).toHaveBeenCalledWith("room-123");
    });

    it("should be keyboard accessible", () => {
      const onSelect = vi.fn();
      render(<ChatRoomCard {...defaultProps} onSelect={onSelect} />);

      const card = screen.getByTestId("chat-room-card");
      fireEvent.keyDown(card, { key: "Enter" });

      expect(onSelect).toHaveBeenCalledWith("room-123");
    });
  });

  describe("Position Context", () => {
    it("should render position context when provided", () => {
      render(<ChatRoomCard {...defaultProps} positionContext="Frontend Developer" />);

      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    it("should not render position context when null", () => {
      render(<ChatRoomCard {...defaultProps} positionContext={null} />);

      // Should not have position context element
      expect(screen.queryByTestId("position-context")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have appropriate aria-label", () => {
      render(<ChatRoomCard {...defaultProps} />);

      const card = screen.getByTestId("chat-room-card");
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("บริษัท ทดสอบ จำกัด")
      );
    });

    it("should indicate unread status in aria-label", () => {
      render(<ChatRoomCard {...defaultProps} unreadCount={3} />);

      const card = screen.getByTestId("chat-room-card");
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("3 ข้อความที่ยังไม่ได้อ่าน")
      );
    });
  });
});
