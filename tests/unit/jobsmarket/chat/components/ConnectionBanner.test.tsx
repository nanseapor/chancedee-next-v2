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

  it('should show "ไม่มีการเชื่อมต่อ" when offline', () => {
    render(<ConnectionBanner status="offline" />);

    expect(screen.getByText("ไม่มีการเชื่อมต่อ")).toBeInTheDocument();
  });

  it("should show reconnecting animation", () => {
    render(<ConnectionBanner status="reconnecting" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("animate-pulse");
  });

  it('should show "กำลังเชื่อมต่อใหม่..." when reconnecting', () => {
    render(<ConnectionBanner status="reconnecting" />);

    expect(screen.getByText("กำลังเชื่อมต่อใหม่...")).toBeInTheDocument();
  });

  it("should have warning styling for offline", () => {
    render(<ConnectionBanner status="offline" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("bg-amber-100", "text-amber-800");
  });

  it("should have info styling for connecting", () => {
    render(<ConnectionBanner status="connecting" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("bg-blue-100", "text-blue-800");
  });

  it("should render loading spinner when connecting", () => {
    render(<ConnectionBanner status="connecting" />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should render offline icon when offline", () => {
    render(<ConnectionBanner status="offline" />);

    expect(screen.getByTestId("offline-icon")).toBeInTheDocument();
  });

  it("should show retry button when offline", () => {
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

  it("should be positioned at top of chat", () => {
    render(<ConnectionBanner status="connecting" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("sticky", "top-0");
  });

  it("should have appropriate z-index to stay above messages", () => {
    render(<ConnectionBanner status="connecting" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("z-10");
  });

  it("should transition smoothly when status changes", async () => {
    const { rerender } = render(<ConnectionBanner status="connecting" />);

    expect(screen.getByTestId("connection-banner")).toBeInTheDocument();

    rerender(<ConnectionBanner status="connected" />);

    // Banner should fade out smoothly
    await waitFor(() => {
      expect(screen.queryByTestId("connection-banner")).not.toBeInTheDocument();
    });
  });

  it("should show error status when connection failed", () => {
    render(<ConnectionBanner status="error" />);

    const banner = screen.getByTestId("connection-banner");
    expect(banner).toHaveClass("bg-red-100", "text-red-800");
    expect(screen.getByText(/เกิดข้อผิดพลาด/i)).toBeInTheDocument();
  });
});
