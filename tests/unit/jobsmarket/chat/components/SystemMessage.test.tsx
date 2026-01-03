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

  it("should render centered container", () => {
    render(<SystemMessage {...defaultProps} />);

    const container = screen.getByTestId("system-message");
    expect(container).toHaveClass("flex", "items-center", "justify-center");
  });

  it("should render message text", () => {
    render(<SystemMessage {...defaultProps} />);

    expect(screen.getByText("การสัมภาษณ์ได้ถูกยืนยันแล้ว")).toBeInTheDocument();
  });

  it("should render timestamp in HH:mm format", () => {
    render(<SystemMessage {...defaultProps} />);

    // Implementation uses date-fns format "HH:mm" which produces "14:30"
    expect(screen.getByText("14:30")).toBeInTheDocument();
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

  it("should render interview confirmation message", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="interview_confirmed"
        message="การสัมภาษณ์ได้ถูกยืนยันแล้ว"
      />
    );

    expect(screen.getByText("การสัมภาษณ์ได้ถูกยืนยันแล้ว")).toBeInTheDocument();
  });

  it("should render interview cancellation message", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="interview_cancelled"
        message="การสัมภาษณ์ถูกยกเลิก"
      />
    );

    expect(screen.getByText("การสัมภาษณ์ถูกยกเลิก")).toBeInTheDocument();
  });

  it("should render interview rescheduled message", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="interview_rescheduled"
        message="มีการเลื่อนวันสัมภาษณ์"
      />
    );

    expect(screen.getByText("มีการเลื่อนวันสัมภาษณ์")).toBeInTheDocument();
  });

  it("should have rounded styling", () => {
    render(<SystemMessage {...defaultProps} />);

    // The inner container has the rounded-lg class
    const container = screen.getByTestId("system-message");
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
  });

  it("should render offer accepted message", () => {
    render(
      <SystemMessage
        {...defaultProps}
        type="offer_accepted"
        message="ข้อเสนอได้รับการยอมรับ"
      />
    );

    expect(screen.getByText("ข้อเสนอได้รับการยอมรับ")).toBeInTheDocument();
  });

  it("should handle long messages gracefully", () => {
    const longMessage = "นี่คือข้อความระบบที่ยาวมากๆ ".repeat(10).trim();
    render(<SystemMessage message={longMessage} timestamp={mockTimestamp} />);

    // Use function matcher for long text to handle whitespace normalization
    const messageElement = screen.getByText((content) =>
      content.includes("นี่คือข้อความระบบที่ยาวมากๆ")
    );
    expect(messageElement).toBeInTheDocument();
  });

  it("should render system-message container", () => {
    render(<SystemMessage {...defaultProps} />);

    expect(screen.getByTestId("system-message")).toBeInTheDocument();
  });
});
