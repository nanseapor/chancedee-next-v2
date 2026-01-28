import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ConnectionBanner } from "@/app/jobsmarket/chat/[roomId]/_components/ConnectionBanner";

describe("ConnectionBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be hidden when connected", () => {
    render(<ConnectionBanner status="connected" />);

    const banner = screen.queryByTestId("connection-banner");
    expect(banner).not.toBeInTheDocument();
  });

  it('should show "กำลังเชื่อมต่อ..." when connecting', () => {
    render(<ConnectionBanner status="connecting" />);

    expect(screen.getByText("กำลังเชื่อมต่อ...")).toBeInTheDocument();
  });

  it('should show offline message when offline', () => {
    render(<ConnectionBanner status="offline" />);

    expect(screen.getByText("ออฟไลน์ - ไม่มีการเชื่อมต่อ")).toBeInTheDocument();
  });

  it("should show spinning icon when reconnecting", () => {
    render(<ConnectionBanner status="reconnecting" />);

    const icon = screen.getByTestId("connection-icon");
    expect(icon).toHaveClass("animate-spin");
  });

  it('should show "กำลังเชื่อมต่อใหม่..." when reconnecting', () => {
    render(<ConnectionBanner status="reconnecting" />);

    expect(screen.getByText("กำลังเชื่อมต่อใหม่...")).toBeInTheDocument();
  });

  it("should have gray styling for offline", () => {
    render(<ConnectionBanner status="offline" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("bg-gray-100", "text-gray-700");
  });

  it("should have blue styling for connecting", () => {
    render(<ConnectionBanner status="connecting" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("bg-blue-100", "text-blue-700");
  });

  it("should render connection icon", () => {
    render(<ConnectionBanner status="connecting" />);

    expect(screen.getByTestId("connection-icon")).toBeInTheDocument();
  });

  it("should render connection message", () => {
    render(<ConnectionBanner status="offline" />);

    expect(screen.getByTestId("connection-message")).toBeInTheDocument();
  });

  it("should show retry button when offline with onRetry", () => {
    render(<ConnectionBanner status="offline" onRetry={() => {}} />);

    expect(screen.getByRole("button", { name: /ลองใหม่/i })).toBeInTheDocument();
  });

  it("should call onRetry when retry button clicked", async () => {
    const onRetry = vi.fn();
    render(<ConnectionBanner status="offline" onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: /ลองใหม่/i });
    retryButton.click();

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should hide retry button when reconnecting", () => {
    render(<ConnectionBanner status="reconnecting" onRetry={() => {}} />);

    expect(
      screen.queryByRole("button", { name: /ลองใหม่/i })
    ).not.toBeInTheDocument();
  });

  it("should transition smoothly when status changes", () => {
    const { rerender } = render(<ConnectionBanner status="connecting" />);

    expect(screen.getByTestId("connection-banner")).toBeInTheDocument();

    rerender(<ConnectionBanner status="connected" />);

    // Banner should not be present when connected (no animation delay needed)
    expect(screen.queryByTestId("connection-banner")).not.toBeInTheDocument();
  });

  it("should show error status when connection failed", () => {
    render(<ConnectionBanner status="error" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("bg-red-100", "text-red-700");
    expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
  });

  it("should show retry button for error status with onRetry", () => {
    render(<ConnectionBanner status="error" onRetry={() => {}} />);

    expect(screen.getByRole("button", { name: /ลองใหม่/i })).toBeInTheDocument();
  });

  it("should have amber styling for reconnecting", () => {
    render(<ConnectionBanner status="reconnecting" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("bg-amber-100", "text-amber-700");
  });
});
