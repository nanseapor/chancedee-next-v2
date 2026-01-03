import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatRoomHeader } from "@/app/jobsmarket/chat/[roomId]/_components/ChatRoomHeader";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

describe("ChatRoomHeader", () => {
  const defaultProps = {
    otherPartyName: "บริษัท เทสต์ จำกัด",
    otherPartyPhoto: "https://example.com/photo.jpg",
    otherPartyId: "company-456",
    positionContext: "Software Engineer",
    isOnline: true,
    onBack: vi.fn(),
    onMenuClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render back button on mobile", () => {
    render(<ChatRoomHeader {...defaultProps} />);

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeInTheDocument();
  });

  it("should render other party avatar with photo", () => {
    render(<ChatRoomHeader {...defaultProps} />);

    // Radix Avatar doesn't render img in test environment (image never "loads")
    // So we verify the avatar container is present and initials are shown as fallback
    // Initials are first chars of each word: "บริษัท เทสต์ จำกัด" -> "บ" + "เ" = "บเ"
    const fallback = screen.getByTestId("avatar-fallback");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("บเ");
  });

  it("should render other party name", () => {
    render(<ChatRoomHeader {...defaultProps} />);

    expect(screen.getByText("บริษัท เทสต์ จำกัด")).toBeInTheDocument();
  });

  it("should render position context if available", () => {
    render(<ChatRoomHeader {...defaultProps} />);

    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("should not render position context if not provided", () => {
    render(<ChatRoomHeader {...defaultProps} positionContext={undefined} />);

    expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument();
  });

  it("should render online status indicator", () => {
    render(<ChatRoomHeader {...defaultProps} isOnline={true} />);

    const onlineIndicator = screen.getByTestId("online-status");
    expect(onlineIndicator).toBeInTheDocument();
    expect(onlineIndicator).toHaveClass("bg-green-500");
  });

  it("should render offline status indicator", () => {
    render(<ChatRoomHeader {...defaultProps} isOnline={false} />);

    const statusIndicator = screen.getByTestId("online-status");
    expect(statusIndicator).toHaveClass("bg-gray-400");
  });

  it("should call onBack when back clicked", () => {
    const onBack = vi.fn();
    render(<ChatRoomHeader {...defaultProps} onBack={onBack} />);

    fireEvent.click(screen.getByTestId("back-button"));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should render menu button", () => {
    render(<ChatRoomHeader {...defaultProps} />);

    const menuButton = screen.getByTestId("menu-button");
    expect(menuButton).toBeInTheDocument();
  });

  it("should call onMenuClick when menu clicked", () => {
    const onMenuClick = vi.fn();
    render(<ChatRoomHeader {...defaultProps} onMenuClick={onMenuClick} />);

    fireEvent.click(screen.getByTestId("menu-button"));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("should render fallback avatar when photo is not provided", () => {
    render(<ChatRoomHeader {...defaultProps} otherPartyPhoto={null} />);

    // Should show initials or default avatar
    const avatar = screen.getByTestId("avatar-fallback");
    expect(avatar).toBeInTheDocument();
  });
});
