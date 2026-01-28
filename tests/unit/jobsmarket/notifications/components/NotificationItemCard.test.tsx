/**
 * @fileoverview Unit tests for NotificationItemCard component
 * @specification NOTIF-R01 §4.2
 *
 * TDD RED Phase: These tests should FAIL because the component doesn't exist yet.
 *
 * Requirements tested:
 * - NOTIF-R01.ui.item: Notification item rendering
 * - NOTIF-R01.ui.item.types: Different notification type displays
 * - NOTIF-R01.ui.item.read: Read/unread visual states
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
// This import will fail - component doesn't exist yet (TDD RED phase)
import { NotificationItemCard } from "@/components/jobsmarket/notifications/NotificationItemCard";
import type { NotificationItem } from "@/types/notification.types";

// Mock Date.now for consistent time formatting tests
const MOCK_NOW = 1736294400000; // 2026-01-08 00:00:00 UTC

describe("NotificationItemCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const interviewNotification: NotificationItem = {
    uid: "notif-interview-1",
    roomId: "room-123",
    type: "interview",
    message: "Interview scheduled for Frontend Developer",
    timestamp: MOCK_NOW - 5 * 60 * 1000, // 5 minutes ago
    isRead: false,
    sender: {
      id: "company-456",
      name: "บริษัท เทสต์ จำกัด",
      avatar: "https://example.com/company.jpg",
    },
    jobTitle: "Frontend Developer",
    interviewDate: "2026-01-15",
    interviewTimeFrom: "10:00",
    interviewTimeTo: "11:00",
    interviewChannel: "online",
    applicationId: "app-789",
  };

  const offerNotification: NotificationItem = {
    uid: "notif-offer-1",
    roomId: "room-456",
    type: "offer",
    message: "You have received a job offer for Backend Developer",
    timestamp: MOCK_NOW - 2 * 60 * 60 * 1000, // 2 hours ago
    isRead: true,
    sender: {
      id: "company-789",
      name: "Another Company",
      avatar: null,
    },
    jobTitle: "Backend Developer",
    applicationId: "app-123",
  };

  const systemNotification: NotificationItem = {
    uid: "notif-system-1",
    roomId: "room-789",
    type: "system",
    message: "Your profile has been verified",
    timestamp: MOCK_NOW - 24 * 60 * 60 * 1000, // 1 day ago
    isRead: false,
    sender: {
      id: "system",
      name: "ChanceDee",
      avatar: null,
    },
  };

  const defaultProps = {
    notification: interviewNotification,
    onMarkAsRead: vi.fn(),
    onClick: vi.fn(),
  };

  describe("Rendering - Common", () => {
    /**
     * Requirement: NOTIF-R01.ui.item
     * "Should render sender avatar"
     */
    it("should render sender avatar", () => {
      render(<NotificationItemCard {...defaultProps} />);

      // Avatar has aria-label on the wrapper, and shows fallback in JSDOM
      // since images don't load in test environment
      const avatar = screen.getByLabelText("บริษัท เทสต์ จำกัด");
      expect(avatar).toBeInTheDocument();
      // Fallback letter should be visible
      expect(screen.getByText("บ")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item
     * "Should render fallback avatar when no photo"
     */
    it("should render fallback avatar when no photo", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={offerNotification}
        />
      );

      // Should show first letter as fallback
      expect(screen.getByText("A")).toBeInTheDocument(); // "Another Company"
    });

    /**
     * Requirement: NOTIF-R01.ui.item
     * "Should render sender name"
     */
    it("should render sender name", () => {
      render(<NotificationItemCard {...defaultProps} />);

      expect(screen.getByText("บริษัท เทสต์ จำกัด")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item
     * "Should render message content"
     */
    it("should render message content", () => {
      render(<NotificationItemCard {...defaultProps} />);

      expect(screen.getByText(/Interview scheduled for Frontend Developer/i)).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.time
     * "Should render relative time in Thai"
     */
    it("should render relative time in Thai", () => {
      render(<NotificationItemCard {...defaultProps} />);

      expect(screen.getByText("5 นาทีที่แล้ว")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.time
     * "Should render hours ago correctly"
     */
    it("should render hours ago correctly", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={offerNotification}
        />
      );

      expect(screen.getByText("2 ชั่วโมงที่แล้ว")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.time
     * "Should render days ago correctly"
     */
    it("should render days ago correctly", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={systemNotification}
        />
      );

      expect(screen.getByText("1 วันที่แล้ว")).toBeInTheDocument();
    });
  });

  describe("Rendering - Interview Type", () => {
    /**
     * Requirement: NOTIF-R01.ui.item.interview
     * "Should show interview icon"
     */
    it("should show interview calendar icon", () => {
      render(<NotificationItemCard {...defaultProps} />);

      expect(screen.getByTestId("notification-icon-interview")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.interview
     * "Should show interview date and time"
     */
    it("should show interview date and time details", () => {
      render(<NotificationItemCard {...defaultProps} />);

      expect(screen.getByText(/15 ม.ค. 2569/i)).toBeInTheDocument(); // Buddhist year
      expect(screen.getByText(/10:00 - 11:00/i)).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.interview
     * "Should show interview channel"
     */
    it("should show interview channel badge", () => {
      render(<NotificationItemCard {...defaultProps} />);

      expect(screen.getByText("ออนไลน์")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.interview
     * "Should show job title"
     */
    it("should show job title", () => {
      render(<NotificationItemCard {...defaultProps} />);

      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });
  });

  describe("Rendering - Offer Type", () => {
    /**
     * Requirement: NOTIF-R01.ui.item.offer
     * "Should show offer icon"
     */
    it("should show offer gift icon", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={offerNotification}
        />
      );

      expect(screen.getByTestId("notification-icon-offer")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.offer
     * "Should show offer job title"
     */
    it("should show offer job title", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={offerNotification}
        />
      );

      expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    });
  });

  describe("Rendering - System Type", () => {
    /**
     * Requirement: NOTIF-R01.ui.item.system
     * "Should show system icon"
     */
    it("should show system info icon", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={systemNotification}
        />
      );

      expect(screen.getByTestId("notification-icon-system")).toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.system
     * "System notifications should not have avatar"
     */
    it("should show ChanceDee branding for system notifications", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={systemNotification}
        />
      );

      expect(screen.getByText("ChanceDee")).toBeInTheDocument();
    });
  });

  describe("Read/Unread State", () => {
    /**
     * Requirement: NOTIF-R01.ui.item.unread
     * "Unread notifications should have indicator"
     */
    it("should show unread indicator when isRead is false", () => {
      render(<NotificationItemCard {...defaultProps} />);

      const unreadIndicator = screen.getByTestId("unread-indicator");
      expect(unreadIndicator).toBeInTheDocument();
      expect(unreadIndicator).toHaveClass("bg-secondary-500");
    });

    /**
     * Requirement: NOTIF-R01.ui.item.read
     * "Read notifications should not have indicator"
     */
    it("should not show unread indicator when isRead is true", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={offerNotification}
        />
      );

      expect(screen.queryByTestId("unread-indicator")).not.toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.unread
     * "Unread notifications should have highlighted background"
     */
    it("should have highlighted background when unread", () => {
      render(<NotificationItemCard {...defaultProps} />);

      const card = screen.getByTestId(`notification-item-${interviewNotification.uid}`);
      expect(card).toHaveClass("bg-secondary-50");
    });

    /**
     * Requirement: NOTIF-R01.ui.item.read
     * "Read notifications should have normal background"
     */
    it("should have normal background when read", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={offerNotification}
        />
      );

      const card = screen.getByTestId(`notification-item-${offerNotification.uid}`);
      expect(card).not.toHaveClass("bg-secondary-50");
    });
  });

  describe("Interaction", () => {
    /**
     * Requirement: NOTIF-R01.ui.item.click
     * "Should call onClick when card clicked"
     */
    it("should call onClick when card clicked", () => {
      const onClick = vi.fn();
      render(<NotificationItemCard {...defaultProps} onClick={onClick} />);

      fireEvent.click(screen.getByTestId(`notification-item-${interviewNotification.uid}`));

      expect(onClick).toHaveBeenCalledWith(interviewNotification);
    });

    /**
     * Requirement: NOTIF-R01.ui.item.markRead
     * "Should call onMarkAsRead when mark as read clicked"
     */
    it("should call onMarkAsRead when mark as read button clicked", () => {
      const onMarkAsRead = vi.fn();
      render(<NotificationItemCard {...defaultProps} onMarkAsRead={onMarkAsRead} />);

      // Find the mark as read button (small dot or menu option)
      const markAsReadBtn = screen.getByLabelText(/ทำเครื่องหมายว่าอ่านแล้ว/i);
      fireEvent.click(markAsReadBtn);

      expect(onMarkAsRead).toHaveBeenCalledWith(interviewNotification.uid);
    });

    /**
     * Requirement: NOTIF-R01.ui.item.markRead
     * "Should not show mark as read for already read items"
     */
    it("should not show mark as read for already read items", () => {
      render(
        <NotificationItemCard
          {...defaultProps}
          notification={offerNotification}
        />
      );

      expect(screen.queryByLabelText(/ทำเครื่องหมายว่าอ่านแล้ว/i)).not.toBeInTheDocument();
    });

    /**
     * Requirement: NOTIF-R01.ui.item.click
     * "Should be keyboard accessible"
     */
    it("should support keyboard activation", () => {
      const onClick = vi.fn();
      render(<NotificationItemCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByTestId(`notification-item-${interviewNotification.uid}`);
      fireEvent.keyDown(card, { key: "Enter" });

      expect(onClick).toHaveBeenCalledWith(interviewNotification);
    });
  });

  describe("Accessibility", () => {
    /**
     * Requirement: NOTIF-R01.a11y
     * "Should have appropriate aria-label"
     */
    it("should have appropriate aria-label", () => {
      render(<NotificationItemCard {...defaultProps} />);

      const card = screen.getByTestId(`notification-item-${interviewNotification.uid}`);
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("บริษัท เทสต์ จำกัด")
      );
    });

    /**
     * Requirement: NOTIF-R01.a11y
     * "Unread items should indicate status"
     */
    it("should indicate unread status in aria-label", () => {
      render(<NotificationItemCard {...defaultProps} />);

      const card = screen.getByTestId(`notification-item-${interviewNotification.uid}`);
      expect(card).toHaveAttribute("aria-label", expect.stringContaining("ยังไม่ได้อ่าน"));
    });

    /**
     * Requirement: NOTIF-R01.a11y
     * "Should have role button or link"
     */
    it("should be clickable element", () => {
      render(<NotificationItemCard {...defaultProps} />);

      const card = screen.getByTestId(`notification-item-${interviewNotification.uid}`);
      expect(card.getAttribute("role")).toMatch(/button|link/);
    });
  });
});
