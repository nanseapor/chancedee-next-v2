import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsTabs } from "@/app/jobsmarket/auth/settings/_components/SettingsTabs";
import type { TabId } from "@/app/jobsmarket/auth/settings/_components/SettingsClient";

/**
 * Integration tests for AUTH-R06 Settings Tabs Component
 * Tests tab rendering, visibility, and navigation
 */

describe("SettingsTabs Component", () => {
  const mockOnTabChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Tab rendering for normal users", () => {
    it("should render all 5 tabs when isPending is false", () => {
      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      // Find tabs by their text content (tabs have both Thai and English)
      expect(screen.getByText("บัญชี")).toBeInTheDocument();
      expect(screen.getByText("รหัสผ่าน")).toBeInTheDocument();
      expect(screen.getByText("การแจ้งเตือน")).toBeInTheDocument();
      expect(screen.getByText("ความเป็นส่วนตัว")).toBeInTheDocument();
      expect(screen.getByText("ลบบัญชี")).toBeInTheDocument();
    });

    it("should render English labels for all tabs", () => {
      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      expect(screen.getByText("Account")).toBeInTheDocument();
      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Privacy")).toBeInTheDocument();
      expect(screen.getByText("Delete Account")).toBeInTheDocument();
    });
  });

  describe("Tab rendering for pending users", () => {
    it("should hide Notifications tab when isPending is true", () => {
      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={true}
        />
      );

      expect(screen.getByText("บัญชี")).toBeInTheDocument();
      expect(screen.getByText("รหัสผ่าน")).toBeInTheDocument();
      expect(screen.queryByText("การแจ้งเตือน")).not.toBeInTheDocument();
      expect(screen.getByText("ความเป็นส่วนตัว")).toBeInTheDocument();
      expect(screen.getByText("ลบบัญชี")).toBeInTheDocument();
    });

    it("should render only 4 tabs when isPending is true", () => {
      const { container } = render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={true}
        />
      );

      const buttons = container.querySelectorAll("button");
      expect(buttons).toHaveLength(4);
    });
  });

  describe("Active tab styling", () => {
    it("should apply active styles to account tab when activeTab is account", () => {
      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const accountTab = screen.getByText("บัญชี").closest("button");
      expect(accountTab).toHaveClass("border-primary", "text-primary");
    });

    it("should apply active styles to password tab when activeTab is password", () => {
      render(
        <SettingsTabs
          activeTab="password"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const passwordTab = screen.getByText("รหัสผ่าน").closest("button");
      expect(passwordTab).toHaveClass("border-primary", "text-primary");
    });

    it("should apply inactive styles to non-active tabs", () => {
      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const passwordTab = screen.getByText("รหัสผ่าน").closest("button");
      expect(passwordTab).toHaveClass("border-transparent", "text-muted-foreground");
    });
  });

  describe("Tab navigation", () => {
    it("should call onTabChange with correct tab id when clicking account tab", async () => {
      const user = userEvent.setup();

      render(
        <SettingsTabs
          activeTab="password"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const accountTab = screen.getByText("บัญชี").closest("button")!;
      await user.click(accountTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("account");
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it("should call onTabChange with correct tab id when clicking password tab", async () => {
      const user = userEvent.setup();

      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const passwordTab = screen.getByRole("button", { name: /รหัสผ่าน/i });
      await user.click(passwordTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("password");
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it("should call onTabChange with correct tab id when clicking notifications tab", async () => {
      const user = userEvent.setup();

      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const notificationsTab = screen.getByRole("button", { name: /การแจ้งเตือน/i });
      await user.click(notificationsTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("notifications");
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it("should call onTabChange with correct tab id when clicking privacy tab", async () => {
      const user = userEvent.setup();

      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const privacyTab = screen.getByRole("button", { name: /ความเป็นส่วนตัว/i });
      await user.click(privacyTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("privacy");
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it("should call onTabChange with correct tab id when clicking delete tab", async () => {
      const user = userEvent.setup();

      render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const deleteTab = screen.getByRole("button", { name: /ลบบัญชี/i });
      await user.click(deleteTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("delete");
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("Tab order", () => {
    it("should render tabs in correct order", () => {
      const { container } = render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={false}
        />
      );

      const buttons = container.querySelectorAll("button");
      const tabLabels = Array.from(buttons).map(
        (button) => button.querySelector("span")?.textContent
      );

      expect(tabLabels).toEqual([
        "บัญชี",
        "รหัสผ่าน",
        "การแจ้งเตือน",
        "ความเป็นส่วนตัว",
        "ลบบัญชี",
      ]);
    });

    it("should render tabs in correct order when Notifications tab is hidden", () => {
      const { container } = render(
        <SettingsTabs
          activeTab="account"
          onTabChange={mockOnTabChange}
          isPending={true}
        />
      );

      const buttons = container.querySelectorAll("button");
      const tabLabels = Array.from(buttons).map(
        (button) => button.querySelector("span")?.textContent
      );

      expect(tabLabels).toEqual([
        "บัญชี",
        "รหัสผ่าน",
        "ความเป็นส่วนตัว",
        "ลบบัญชี",
      ]);
    });
  });
});
