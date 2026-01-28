import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DateDivider } from "@/app/jobsmarket/chat/[roomId]/_components/DateDivider";

describe("DateDivider", () => {
  // Use fixed dates for consistent testing
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

    // Implementation uses date-fns format "d MMMM yyyy" with Thai locale
    // This produces "8 มกราคม 2024"
    expect(screen.getByText(/8/)).toBeInTheDocument();
    expect(screen.getByText(/มกราคม/)).toBeInTheDocument();
  });

  it("should be centered", () => {
    render(<DateDivider date={new Date()} />);

    const divider = screen.getByTestId("date-divider");
    expect(divider).toHaveClass("flex", "items-center", "justify-center");
  });

  it("should handle timestamp input", () => {
    const timestamp = new Date("2024-01-10T10:30:00").getTime();
    render(<DateDivider date={timestamp} />);

    // Implementation formats as "d MMMM yyyy"
    // For Jan 10 this would be "10 มกราคม 2024"
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/มกราคม/)).toBeInTheDocument();
  });

  it("should render date-divider container", () => {
    render(<DateDivider date={new Date()} />);

    expect(screen.getByTestId("date-divider")).toBeInTheDocument();
  });

  it("should render date label for today", () => {
    render(<DateDivider date={mockToday} />);

    expect(screen.getByText("วันนี้")).toBeInTheDocument();
  });

  it("should render with rounded pill styling", () => {
    render(<DateDivider date={new Date()} />);

    // The inner element has rounded-full class
    const divider = screen.getByTestId("date-divider");
    expect(divider.querySelector(".rounded-full")).toBeInTheDocument();
  });
});
