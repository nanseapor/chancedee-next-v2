import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "@/app/jobsmarket/chat/[roomId]/_components/MessageInput";

describe("MessageInput", () => {
  const defaultProps = {
    onSend: vi.fn(),
    onAttachmentClick: vi.fn(),
    isSending: false,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render text input", () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should render send button", () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByTestId("send-button")).toBeInTheDocument();
  });

  it("should render attachment button", () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByTestId("attachment-button")).toBeInTheDocument();
  });

  it("should disable send when input empty", () => {
    render(<MessageInput {...defaultProps} />);

    const sendButton = screen.getByTestId("send-button");
    expect(sendButton).toBeDisabled();
  });

  it("should enable send when input has text", async () => {
    render(<MessageInput {...defaultProps} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Hello");

    const sendButton = screen.getByTestId("send-button");
    expect(sendButton).not.toBeDisabled();
  });

  it("should call onSend when send clicked", async () => {
    const onSend = vi.fn();
    render(<MessageInput {...defaultProps} onSend={onSend} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Test message");

    fireEvent.click(screen.getByTestId("send-button"));

    expect(onSend).toHaveBeenCalledWith("Test message");
  });

  it("should call onSend on Enter key", async () => {
    const onSend = vi.fn();
    render(<MessageInput {...defaultProps} onSend={onSend} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Test message");
    await userEvent.keyboard("{Enter}");

    expect(onSend).toHaveBeenCalledWith("Test message");
  });

  it("should clear input after send", async () => {
    const onSend = vi.fn();
    render(<MessageInput {...defaultProps} onSend={onSend} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Test message");
    fireEvent.click(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it('should have placeholder "พิมพ์ข้อความ..."', () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByPlaceholderText("พิมพ์ข้อความ...")).toBeInTheDocument();
  });

  it("should call onAttachmentClick when attachment button clicked", () => {
    const onAttachmentClick = vi.fn();
    render(<MessageInput {...defaultProps} onAttachmentClick={onAttachmentClick} />);

    fireEvent.click(screen.getByTestId("attachment-button"));

    expect(onAttachmentClick).toHaveBeenCalledTimes(1);
  });

  it("should disable all inputs when disabled prop is true", () => {
    render(<MessageInput {...defaultProps} disabled={true} />);

    const input = screen.getByRole("textbox");
    const sendButton = screen.getByTestId("send-button");
    const attachmentButton = screen.getByTestId("attachment-button");

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(attachmentButton).toBeDisabled();
  });

  it("should trim whitespace before sending", async () => {
    const onSend = vi.fn();
    render(<MessageInput {...defaultProps} onSend={onSend} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "  Test message  ");
    fireEvent.click(screen.getByTestId("send-button"));

    expect(onSend).toHaveBeenCalledWith("Test message");
  });

  it("should not send whitespace-only messages", async () => {
    const onSend = vi.fn();
    render(<MessageInput {...defaultProps} onSend={onSend} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   " } });

    // Send button should be disabled
    const sendButton = screen.getByTestId("send-button");
    expect(sendButton).toBeDisabled();
  });

  it("should render message-input-container", () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByTestId("message-input-container")).toBeInTheDocument();
  });

  it("should render message-textarea", () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByTestId("message-textarea")).toBeInTheDocument();
  });
});
