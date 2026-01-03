import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DateDivider } from "@/app/jobsmarket/chat/[roomId]/_components/DateDivider";

describe("DateDivider", () => {
  // Use fixed dates for consistent testing
  const realDate = Date;
  const mockToday = new Date("2024-01-15T12:00:00");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render "วันนี้" for today', () => {
    const today = new Date("2024-01-15T10:30:00");
    render(<DateDivider date={today} />);

    expect(screen.getByText("วันนี้")).toBeInTheDocument();
  });

  it('should render "เมื่อวาน" for yesterday', () => {
    const yesterday = new Date("2024-01-14T10:30:00");
    render(<DateDivider date={yesterday} />);

    expect(screen.getByText("เมื่อวาน")).toBeInTheDocument();
  });

  it("should render Thai date for older dates", () => {
    const lastWeek = new Date("2024-01-08T10:30:00");
    render(<DateDivider date={lastWeek} />);

    // Should show Thai formatted date (e.g., "8 มกราคม 2567")
    const expectedDate = lastWeek.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("should be centered with lines", () => {
    render(<DateDivider date={new Date()} />);

    const divider = screen.getByTestId("date-divider");
    expect(divider).toHaveClass("flex", "items-center", "justify-center");

    // Should have decorative lines on both sides
    const lines = screen.getAllByTestId("divider-line");
    expect(lines).toHaveLength(2);
  });

  it("should render with correct styling", () => {
    render(<DateDivider date={new Date()} />);

    const text = screen.getByTestId("date-text");
    expect(text).toHaveClass("text-gray-500", "text-sm");
  });

  it("should handle timestamp input", () => {
    const timestamp = new Date("2024-01-10T10:30:00").getTime();
    render(<DateDivider date={timestamp} />);

    const expectedDate = new Date(timestamp).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("should show day of week for dates within last 7 days", () => {
    const threeDaysAgo = new Date("2024-01-12T10:30:00"); // Friday
    render(<DateDivider date={threeDaysAgo} />);

    // Should show day name for recent dates (within a week but not today/yesterday)
    const expectedDay = threeDaysAgo.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    expect(screen.getByText(expectedDay)).toBeInTheDocument();
  });

  it("should render in muted colors", () => {
    render(<DateDivider date={new Date()} />);

    const container = screen.getByTestId("date-divider");
    expect(container).toHaveClass("text-gray-500");
  });
});
