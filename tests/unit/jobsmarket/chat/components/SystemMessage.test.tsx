import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SystemMessage } from "@/app/jobsmarket/chat/[roomId]/_components/SystemMessage";

describe("SystemMessage", () => {
  const mockTimestamp = new Date("2024-01-15T14:30:00").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T15:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    message: "การสัมภาษณ์ได้ถูกยืนยันแล้ว",
    timestamp: mockTimestamp,
  };

  it("should render centered text", () => {
    render(<SystemMessage {...defaultProps} />);

    const container = screen.getByTestId("system-message");
    expect(container).toHaveClass("text-center");
  });

  it("should apply muted styling", () => {
    render(<SystemMessage {...defaultProps} />);

    const container = screen.getByTestId("system-message");
    expect(container).toHaveClass("text-gray-500", "text-sm");
  });

  it("should render message text", () => {
    render(<SystemMessage {...defaultProps} />);

    expect(screen.getByText("การสัมภาษณ์ได้ถูกยืนยันแล้ว")).toBeInTheDocument();
  });

  it("should render timestamp", () => {
    render(<SystemMessage {...defaultProps} />);

    const timeString = new Date(mockTimestamp).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    expect(screen.getByText(timeString)).toBeInTheDocument();
  });

  it("should render with icon if type is provided", () => {
    render(<SystemMessage {...defaultProps} type="interview_confirmed" />);

    expect(screen.getByTestId("system-message-icon")).toBeInTheDocument();
  });

  it("should render interview confirmation message with check icon", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="interview_confirmed"
        message="การสัมภาษณ์ได้ถูกยืนยันแล้ว"
      />
    );

    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("should render interview cancellation message with X icon", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="interview_cancelled"
        message="การสัมภาษณ์ถูกยกเลิก"
      />
    );

    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("should render interview rescheduled message with calendar icon", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="interview_rescheduled"
        message="มีการเลื่อนวันสัมภาษณ์"
      />
    );

    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
  });

  it("should have background styling to distinguish from regular messages", () => {
    render(<SystemMessage {...defaultProps} />);

    const container = screen.getByTestId("system-message");
    expect(container).toHaveClass("bg-gray-50", "rounded-lg");
  });

  it("should have proper spacing", () => {
    render(<SystemMessage {...defaultProps} />);

    const container = screen.getByTestId("system-message");
    expect(container).toHaveClass("py-2", "px-4", "my-2");
  });

  it("should render user joined message", () => {
    render(
      <SystemMessage
        message="ผู้สมัครได้เข้าร่วมการสนทนา"
        timestamp={mockTimestamp}
        type="user_joined"
      />
    );

    expect(screen.getByText("ผู้สมัครได้เข้าร่วมการสนทนา")).toBeInTheDocument();
  });

  it("should render offer accepted message with star icon", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="offer_accepted"
        message="ข้อเสนอได้รับการยอมรับ"
      />
    );

    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
  });

  it("should handle long messages gracefully", () => {
    const longMessage = "นี่คือข้อความระบบที่ยาวมากๆ ".repeat(10);
    render(<SystemMessage message={longMessage} timestamp={mockTimestamp} />);

    const messageElement = screen.getByText(longMessage);
    expect(messageElement).toBeInTheDocument();
  });
});
