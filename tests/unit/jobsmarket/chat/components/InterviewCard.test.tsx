import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { InterviewCard } from "@/app/jobsmarket/chat/[roomId]/_components/InterviewCard";

describe("InterviewCard", () => {
  // Create a date in the future for testing
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const defaultInterview = {
    uid: "interview-001",
    appointment: tomorrow.getTime(),
    channel: "online" as const,
    status: "pending" as const,
    isCancel: false,
    isAccepted: false,
    from: "10:00",
    to: "11:00",
    location: null,
    meetingLink: "https://meet.google.com/xxx-xxxx-xxx",
    candidateName: "สมชาย ใจดี",
    companyName: "บริษัท เทสต์ จำกัด",
    jobId: "job-123",
    applicationId: "app-456",
    candidateId: "candidate-789",
    companyId: "company-012",
    note: "Interview for Software Engineer position",
  };

  const defaultProps = {
    interview: defaultInterview,
    userRole: "candidate" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("display", () => {
    it("should render interview date", () => {
      render(<InterviewCard {...defaultProps} />);

      // Implementation uses date-fns format "EEEE d MMMM yyyy" with Thai locale
      // This produces format like "จันทร์ 5 มกราคม 2026"
      const dateElement = screen.getByTestId("interview-date");
      expect(dateElement).toBeInTheDocument();
      // Verify it has some date content (exact format depends on date-fns Thai locale)
      expect(dateElement.textContent).toBeTruthy();
    });

    it("should render interview time range", () => {
      render(<InterviewCard {...defaultProps} />);

      expect(screen.getByText("10:00 - 11:00")).toBeInTheDocument();
    });

    it("should render interview channel (online/onsite)", () => {
      render(<InterviewCard {...defaultProps} />);

      expect(screen.getByText("สัมภาษณ์ออนไลน์")).toBeInTheDocument();
    });

    it("should render onsite channel correctly", () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, channel: "onsite" }}
        />
      );

      expect(screen.getByText("สัมภาษณ์ที่บริษัท")).toBeInTheDocument();
    });

    it("should render location for onsite", () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{
            ...defaultInterview,
            channel: "onsite",
            location: "อาคาร ABC ชั้น 10 ห้อง 1001",
          }}
        />
      );

      expect(screen.getByText("อาคาร ABC ชั้น 10 ห้อง 1001")).toBeInTheDocument();
    });

    it("should render meeting link for online", () => {
      render(<InterviewCard {...defaultProps} />);

      const meetingLink = screen.getByTestId("meeting-link");
      expect(meetingLink).toBeInTheDocument();
      expect(meetingLink).toHaveAttribute(
        "href",
        "https://meet.google.com/xxx-xxxx-xxx"
      );
    });

    it("should not render meeting link for onsite", () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{
            ...defaultInterview,
            channel: "onsite",
            meetingLink: null,
          }}
        />
      );

      expect(screen.queryByTestId("meeting-link")).not.toBeInTheDocument();
    });
  });

  describe("status", () => {
    it('should render "รอยืนยัน" for pending', () => {
      render(<InterviewCard {...defaultProps} />);

      expect(screen.getByText("รอยืนยัน")).toBeInTheDocument();
    });

    it('should render "ยืนยันแล้ว" for confirmed', () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, status: "confirmed", isAccepted: true }}
        />
      );

      expect(screen.getByText("ยืนยันแล้ว")).toBeInTheDocument();
    });

    it('should render "ยกเลิก" for cancelled', () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, status: "cancelled", isCancel: true }}
        />
      );

      expect(screen.getByText("ยกเลิก")).toBeInTheDocument();
    });

    it('should render "เลื่อนนัด" for rescheduled', () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, status: "rescheduled" }}
        />
      );

      expect(screen.getByText("เลื่อนนัด")).toBeInTheDocument();
    });

    it("should apply correct status color for pending (waiting variant)", () => {
      render(<InterviewCard {...defaultProps} />);

      const badge = screen.getByTestId("interview-status-badge");
      expect(badge).toHaveClass("bg-amber-100", "text-amber-700");
    });

    it("should apply correct status color for confirmed (success variant)", () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, status: "confirmed", isAccepted: true }}
        />
      );

      const badge = screen.getByTestId("interview-status-badge");
      expect(badge).toHaveClass("bg-green-100", "text-green-700");
    });

    it("should apply correct status color for cancelled (problem variant)", () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, status: "cancelled", isCancel: true }}
        />
      );

      const badge = screen.getByTestId("interview-status-badge");
      expect(badge).toHaveClass("bg-rose-100", "text-rose-700");
    });

    it("should apply correct status color for rescheduled (waiting variant)", () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, status: "rescheduled" }}
        />
      );

      // Rescheduled uses 'waiting' variant which is amber
      const badge = screen.getByTestId("interview-status-badge");
      expect(badge).toHaveClass("bg-amber-100", "text-amber-700");
    });
  });

  describe("Phase 2 - Read Only", () => {
    it("should NOT render action buttons (Phase 2 read-only)", () => {
      render(<InterviewCard {...defaultProps} />);

      // No confirm button
      expect(
        screen.queryByRole("button", { name: /ยืนยัน/i })
      ).not.toBeInTheDocument();

      // No decline button
      expect(
        screen.queryByRole("button", { name: /ปฏิเสธ/i })
      ).not.toBeInTheDocument();

      // No reschedule button
      expect(
        screen.queryByRole("button", { name: /เลื่อน/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("additional information", () => {
    it("should render note if available", () => {
      render(<InterviewCard {...defaultProps} />);

      expect(
        screen.getByText("Interview for Software Engineer position")
      ).toBeInTheDocument();
    });

    it("should not render note section if no note", () => {
      render(
        <InterviewCard
          {...defaultProps}
          interview={{ ...defaultInterview, note: null }}
        />
      );

      expect(screen.queryByTestId("interview-note")).not.toBeInTheDocument();
    });

    it("should render card title", () => {
      render(<InterviewCard {...defaultProps} />);

      expect(screen.getByText("นัดสัมภาษณ์")).toBeInTheDocument();
    });
  });

  describe("interview card structure", () => {
    it("should render interview-card container", () => {
      render(<InterviewCard {...defaultProps} />);

      expect(screen.getByTestId("interview-card")).toBeInTheDocument();
    });

    it("should render interview-time element", () => {
      render(<InterviewCard {...defaultProps} />);

      expect(screen.getByTestId("interview-time")).toBeInTheDocument();
    });

    it("should render interview-channel element", () => {
      render(<InterviewCard {...defaultProps} />);

      expect(screen.getByTestId("interview-channel")).toBeInTheDocument();
    });
  });
});
